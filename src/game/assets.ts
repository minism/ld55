import { Assets } from "pixi.js";

const assetPaths = {
  flower: "/sprites/flower.png",
};

export type AssetKey = keyof typeof assetPaths;

export async function loadAllAssetsBackground() {
  const urls = Object.values(assetPaths).map((path) => `/assets${path}`);
  await Assets.backgroundLoad(urls);
}

export async function getAsset(key: AssetKey) {
  const path = assetPaths[key];
  const url = `/assets${path}`;
  return await Assets.load(url);
}
