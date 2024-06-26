import { Assets, Texture } from "pixi.js";

const assetPaths = {
  flower: "/sprites/flower.png",
  hexBase: "/sprites/hex-base.png",
  hexGrass: "/sprites/hex-grass.png",
  hexForest: "/sprites/hex-forest.png",
  hexWater: "/sprites/hex-water.png",
  wizard: "/sprites/wizard.png",
  jelly: "/sprites/jelly.png",
  golem: "/sprites/golem.png",
  minotaur: "/sprites/minotaur.png",
  archer: "/sprites/archer.png",
  airElemental: "/sprites/air-elemental-2.png",
  magicMissile: "/sprites/magic-missile.png",
  summon: "/sprites/summon.png",
  blink: "/sprites/blink.png",
  heal: "/sprites/heal.png",
  manaCrystal: "/sprites/mana-crystal.png",
  ourPlayerIndicator: "/sprites/our-player-indicator.png",
  opponentPlayerIndicator: "/sprites/opponent-player-indicator.png",
};

export type AssetKey = keyof typeof assetPaths;

export async function loadAllAssets() {
  const urls = Object.values(assetPaths).map((path) => `/assets${path}`);
  Assets.init();

  // Note we use this over Assets.backgroundLoad() since that doesn't seem to fill the cache.
  return await Promise.all(urls.map((url) => Assets.load(url)));
}

export function getAssetUrl(key: AssetKey) {
  const path = assetPaths[key];
  const url = `/assets${path}`;
  return url;
}

export function getAsset(key: AssetKey) {
  return Assets.get(getAssetUrl(key));
}

export function getTexture(key: AssetKey) {
  const tex = getAsset(key) as Texture;
  tex.source.scaleMode = "nearest";
  return tex;
}
