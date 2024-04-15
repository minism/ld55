import { apiAttack, apiCast, apiMove } from "@/game/api";
import { IGameEvents } from "@/game/controller/IGameEvents";
import { cardDefsByEntityId } from "@/game/data/cardDefs";
import { EntityDef, entityDefsById } from "@/game/data/entityDefs";
import {
  fetchGameState,
  fetchPlayersForGame as fetchUserProfilesForGame,
  provideSupabaseClient,
} from "@/game/db/db";
import { Entity, TurnAction } from "@/game/db/gameState";
import { DbGame } from "@/game/db/types";
import { TileType } from "@/game/model/WorldTile";
import { EventLog } from "@/game/model/eventLog";
import { GameModel } from "@/game/model/gameModel";
import { TooltipModel } from "@/game/model/tooltipModel";
import GameRenderer, { initGameRenderer } from "@/game/renderer/GameRenderer";
import { capitalize } from "@/game/util/string";
import { createClient } from "@/supabase/client";
import { RealtimeChannel, RealtimePresenceState } from "@supabase/supabase-js";
import { Hex } from "honeycomb-grid";
import _ from "lodash";
import { autorun, configure } from "mobx";

configure({
  enforceActions: "never",
});

// Invariants for the game client.
export interface GameClientProps {
  gameId: string;
  userId: string;
}

export class GameController implements IGameEvents {
  // @ts-expect-error: create a base state for this.
  public model: GameModel;
  public readonly eventLog: EventLog;
  public readonly tooltip: TooltipModel;

  private renderer: GameRenderer | null = null;
  private readonly presenceChannel: RealtimeChannel;
  private readonly dbChannel: RealtimeChannel;

  private lastLoggedTurnActionIndex: number = -1;

  constructor(
    private readonly clientProps: GameClientProps,
    private readonly container: HTMLElement
  ) {
    const supabase = createClient();
    provideSupabaseClient(supabase);
    this.presenceChannel = supabase.channel(`game-${clientProps.gameId}`);
    this.dbChannel = supabase.channel("db-updates");

    // Create models
    this.eventLog = new EventLog();
    this.tooltip = new TooltipModel();
  }

  public async init() {
    // Init game state.
    const dbGame = await fetchGameState(this.clientProps.gameId);
    this.model = new GameModel(dbGame, this.clientProps.userId);

    // Init player state.
    const profiles = await fetchUserProfilesForGame(dbGame);
    this.model.provideUserProfiles(profiles);

    // Setup the renderer.
    this.renderer = await initGameRenderer(this.container, this);
    autorun(() => {
      this.renderer!.update(this.model!);
    });
    this.renderer.update(this.model);

    // Setup supabase realtime event listeners.
    this.presenceChannel
      .on("presence", { event: "sync" }, () => {
        this.handlePresenceSync(this.presenceChannel.presenceState());
      })
      .subscribe();

    this.dbChannel
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game",
          filter: `id=eq.${this.clientProps.gameId}`,
        },
        (payload) => {
          // Typing issue here but it should be the same
          // @ts-expect-error
          this.handleDbGameUpdate(payload.new);
        }
      )
      .subscribe();

    // Player init logic.
    this.presenceChannel.track({
      userId: this.clientProps.userId,
    });

    // Initial status message.
    if (this.model.hasGameStarted()) {
      this.log(`Continuing game at turn ${this.model.state.turn}`);
    } else {
      this.log("Waiting for another player to join...");
    }
  }

  private log(...args: Parameters<(typeof EventLog)["prototype"]["log"]>) {
    this.eventLog.log(...args);
  }

  private logTurnAction(action: TurnAction) {
    const player = this.model.playerForTurn();
    const opponent = this.model.opponentForTurn();
    if (action.type == "draw") {
      this.log(`${player?.profile.username} drew a card.`);
    } else if (action.type == "cast") {
      const cardDef = cardDefsByEntityId[action.actionEntityDefId!];
      if (cardDef.type == "summon") {
        this.log(`${player?.profile.username} started summoning something.`);
      } else {
        this.log(`${player?.profile.username} cast ${cardDef.name}.`);
      }
    } else if (action.type == "attack") {
      const sourceDef = entityDefsById[action.actionEntityDefId!];
      const targetDef = entityDefsById[action.targetEntityDefId!];
      const sourceName =
        cardDefsByEntityId[sourceDef.id]?.name ?? capitalize(sourceDef.id);
      const targetName =
        cardDefsByEntityId[targetDef.id]?.name ?? capitalize(targetDef.id);

      this.log(
        `${player?.profile.username}'s ${sourceName} attacked ${opponent?.profile.username}'s ${targetName} for ${sourceDef.attack} damage.`
      );
    } else if (action.type == "kill") {
      const targetDef = entityDefsById[action.targetEntityDefId!];
      const targetName =
        cardDefsByEntityId[targetDef.id]?.name ?? capitalize(targetDef.id);
      this.log(`${opponent?.profile.username}'s ${targetName} was killed!`);
    }
  }

  /**
   * Private logic routines
   */

  private selectEntity(entity: Entity) {
    this.model.selectedEntity = entity;
    this.model.availableActionLocations = [];
    this.model.availableAttackLocations = [];
    const def = entityDefsById[entity.def];

    // Update available tiles.
    if (entity.remainingMoves > 0) {
      this.updateAvailableLocations(
        new Hex(entity.tile),
        def.moveSpeed,
        new Set([TileType.GRASS, TileType.FOREST]),
        false /* allowOccupiedTiles */
      );
    }

    if (entity.remainingAttacks > 0) {
      this.updateAttackLocations(new Hex(entity.tile), def.range ?? 1);
    }
  }

  private startSummon(entityDef: EntityDef) {
    this.model.selectedSummon = entityDef;
    this.model.availableActionLocations = [];
    this.model.availableAttackLocations = [];
    const wizard = this.model.getOurWizard();

    // Update available tiles.
    this.updateAvailableLocations(
      new Hex(wizard.tile),
      entityDef.moveSpeed,
      new Set([TileType.GRASS, TileType.FOREST]),
      false /* allowOccupiedTiles */
    );
  }

  private startSpell(entityDef: EntityDef) {
    this.model.selectedSpell = entityDef;
    this.model.availableActionLocations = [];
    this.model.availableAttackLocations = [];
    const wizard = this.model.getOurWizard();

    const tileTypes = new Set([
      TileType.GRASS,
      TileType.FOREST,
      TileType.WATER,
    ]);
    let allowOccupiedTiles = true;

    // TODO: Abstraction here obviously but no time
    if (entityDef.id == "blink") {
      tileTypes.delete(TileType.WATER);
      allowOccupiedTiles = false;
    }

    if (entityDef.attack > 0) {
      this.updateAttackLocations(new Hex(wizard.tile), entityDef.moveSpeed);
    }

    // Update available tiles.
    this.updateAvailableLocations(
      new Hex(wizard.tile),
      entityDef.moveSpeed,
      tileTypes,
      allowOccupiedTiles
    );
  }

  private updateAvailableLocations(
    origin: Hex,
    radius: number,
    allowedTileTypes: Set<TileType>,
    allowOccupiedTiles: boolean,
    allowAttackLocations = false
  ) {
    // Start with traversable tiles.
    const availableTiles = _.chain(
      this.model.world.findNeighborsMatching(origin, radius, allowedTileTypes)
    )
      // Filter out occupied spaces.
      .filter((hex) => allowOccupiedTiles || !this.model.hasEntityForHex(hex))
      .filter((hex) => allowOccupiedTiles || !this.model.hasSummonForHex(hex))
      .filter(
        (hex) =>
          allowAttackLocations ||
          !_.some(this.model.availableAttackLocations, (h) => h.equals(hex))
      )
      .value();
    this.model.availableActionLocations = availableTiles;
  }

  private updateAttackLocations(origin: Hex, radius: number) {
    // Start with traversable tiles.
    const tiles = _.chain(this.model.world.allNeighbors(origin, radius))
      .filter((hex) => {
        const entity = this.model.getEntitiesForHex(hex)[0];
        return entity != null && !this.model.ownsEntity(entity);
      })
      .value();
    this.model.availableAttackLocations = tiles;
  }

  private async attackWithPrediction(entityId: number, q: number, r: number) {
    this.model.predictAttack(entityId, q, r);
    return await apiAttack({
      gameId: this.model.dbGame.id,
      entityId,
      q,
      r,
    });
  }

  private async moveWithPrediction(entityId: number, q: number, r: number) {
    this.model.predictMove(entityId, q, r);
    return await apiMove({
      gameId: this.model.dbGame.id,
      entityId,
      q,
      r,
    });
  }

  private async castWithPrediction(cardIndex: number, q: number, r: number) {
    this.model.predictCast(cardIndex, q, r);
    await apiCast({
      gameId: this.model.dbGame.id,
      cardIndex,
      q,
      r,
    });
  }

  /**
   * EVENTS
   */

  private async handlePresenceSync(presenceState: RealtimePresenceState<any>) {
    if (this.model == null) {
      throw new Error("Must init game state before supabase presence");
    }

    // Update player connection status.
    const connectedPlayers = new Set();
    for (const presenceList of Object.values(presenceState)) {
      if (presenceList.length != 1) {
        console.log("Presence list different than 1");
        console.dir(presenceList);
      } else {
        const state = presenceList[0];
        connectedPlayers.add(state.userId);
      }
    }

    if (this.model.host) {
      const connected = connectedPlayers.has(this.model.host.profile.id);
      if (connected != this.model.host.connected) {
        this.log(
          `${this.model.host.profile.username} ${
            connected ? "connected" : "disconnected"
          }`
        );
        this.model.host = {
          ...this.model.host,
          connected,
        };
      }
    }

    if (this.model.challenger) {
      const connected = connectedPlayers.has(this.model.challenger.profile.id);
      if (connected != this.model.challenger.connected) {
        this.log(
          `${this.model.challenger.profile.username} ${
            connected ? "connected" : "disconnected"
          }`
        );
        this.model.challenger = {
          ...this.model.challenger,
          connected,
        };
      }
    }
  }

  private async handleDbGameUpdate(game: DbGame) {
    const lastTurn = this.model.dbGame.state.turn;
    const lastChallengerId = this.model.dbGame.challenger_id;
    this.model.dbGame = game;

    // Fetch data if needed.
    if (game.challenger_id != lastChallengerId) {
      const profiles = await fetchUserProfilesForGame(game);
      this.model.provideUserProfiles(profiles);
    }

    // Turn message.
    if (game.state.turn > lastTurn) {
      const player = this.model.playerForTurn();
      this.log("");
      this.log(`[Turn ${game.state.turn} - ${player?.profile.username}]`);
      this.lastLoggedTurnActionIndex = -1;
    }

    // Action message.
    for (
      let i = this.lastLoggedTurnActionIndex + 1;
      i < game.state.turnActions.length;
      i++
    ) {
      const action = game.state.turnActions[i];
      this.lastLoggedTurnActionIndex = i;
      this.logTurnAction(action);
    }
  }

  public async handleShowHexTooltip(hex: Hex) {
    if (this.renderer == null) {
      return;
    }
    this.tooltip.visible = true;
    const pos = this.renderer.getScreenPositionForHex(hex);
    this.tooltip.positionX = pos.x;
    this.tooltip.positionY = pos.y;

    this.tooltip.tile = this.model.world.getTile(hex);
    this.tooltip.entities = this.model.getEntitiesForHex(hex);
  }

  public handleHideTooltip() {
    this.tooltip.visible = false;
  }

  public async handleClickWorldHex(hex: Hex) {
    // Ensure we always clear the selection.
    const { selectedEntity, selectedSummon, selectedSpell } = this.model;
    this.model.selectedEntity = null;
    this.model.selectedSummon = null;
    this.model.selectedSpell = null;

    // No actions if its not our turn.
    if (!this.model.isOurTurn()) {
      this.model.selectedEntity = null;
      return;
    }

    const clickedOnAvailableLocation = this.model.availableActionLocations.find(
      (h) => h.equals(hex)
    );
    const clickedOnAttackLocation = this.model.availableAttackLocations.find(
      (h) => h.equals(hex)
    );

    // Try attacking.
    if (
      selectedEntity != null &&
      selectedEntity.remainingAttacks > 0 &&
      clickedOnAttackLocation
    ) {
      return this.attackWithPrediction(selectedEntity.id, hex.q, hex.r);
    }

    // Try moving.
    if (
      selectedEntity != null &&
      selectedEntity.remainingMoves > 0 &&
      clickedOnAvailableLocation
    ) {
      return this.moveWithPrediction(selectedEntity.id, hex.q, hex.r);
    }

    // Try summoning.
    else if (selectedSummon != null && clickedOnAvailableLocation) {
      return this.castWithPrediction(
        this.model.selectedCardIndex,
        hex.q,
        hex.r
      );
    }

    // Try casting.
    else if (selectedSpell != null) {
      if (
        (selectedSpell.attack > 0 && clickedOnAttackLocation) ||
        clickedOnAvailableLocation
      ) {
        return this.castWithPrediction(
          this.model.selectedCardIndex,
          hex.q,
          hex.r
        );
      }
    }

    // Try selecting an entity.
    else {
      // TODO: Handle multiple entities.
      const entities = this.model.getEntitiesForHex(hex);
      if (entities.length < 1) {
        return;
      }

      const entity = entities[0];
      if (!this.model.ownsEntity(entity)) {
        // Ignore clicks on other entities for now.
        return;
      }

      this.selectEntity(entity);
    }
  }

  public handleTryCast(cardIndex: number): boolean {
    if (!this.model.isOurTurn()) {
      // this.model.flashMessage = "Can't cast on oppone"
      return false;
    }

    const cardDef = cardDefsByEntityId[this.model.getOurHand()[cardIndex]];
    if (cardDef.cost > this.model.getOurPlayerState().mp) {
      this.model.flashMessage = "Not enough mana";
      return false;
    }

    if (cardDef.type == "mana") {
      if (this.model.getOurPlayerState().manaThisTurn) {
        this.model.flashMessage = "Already cast mana crystal this turn";
        return false;
      }

      this.castWithPrediction(cardIndex, 0, 0);
      return false;
    } else if (cardDef.type == "summon") {
      this.model.selectedCardIndex = cardIndex;
      this.startSummon(entityDefsById[cardDef.entityId]);
    } else if (cardDef.type == "spell") {
      this.model.selectedCardIndex = cardIndex;
      this.startSpell(entityDefsById[cardDef.entityId]);
    }

    return true;
  }
}
