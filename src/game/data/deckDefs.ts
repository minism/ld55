export interface DeckDef {
  cards: {
    cardEntityId: string;
    copies: number;
  }[];
}

export const standardDeck: DeckDef = {
  cards: [
    { cardEntityId: "jelly", copies: 4 },
    { cardEntityId: "golem", copies: 4 },
    { cardEntityId: "minotaur", copies: 4 },
    { cardEntityId: "archer", copies: 4 },
    { cardEntityId: "airElemental", copies: 4 },
    { cardEntityId: "magicMissile", copies: 6 },
    { cardEntityId: "blink", copies: 4 },
    { cardEntityId: "heal", copies: 4 },
    { cardEntityId: "mana", copies: 20 },
  ],
};
