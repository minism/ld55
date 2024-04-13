import { Assets, Texture } from "pixi.js";

const assetPaths = {
  flower: "/sprites/flower.png",
  hexBase: "/sprites/hex-base.png",
  hexGrass: "/sprites/hex-grass.png",
};

export type AssetKey = keyof typeof assetPaths;

export async function loadAllAssets() {
  const urls = Object.values(assetPaths).map((path) => `/assets${path}`);
  Assets.init();

  // Note we use this over Assets.backgroundLoad() since that doesn't seem to fill the cache.
  return await Promise.all(urls.map((url) => Assets.load(url)));
}

export function getAsset(key: AssetKey) {
  const path = assetPaths[key];
  const url = `/assets${path}`;
  return Assets.get(url);
}

export function getTexture(key: AssetKey) {
  const tex = getAsset(key) as Texture;
  tex.source.scaleMode = "nearest";
  return tex;
}
