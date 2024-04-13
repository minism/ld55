import { Assets, Texture } from "pixi.js";

const assetPaths = {
  flower: "/sprites/flower.png",
  hexBase: "/sprites/hex-base.png",
  hexGrass: "/sprites/hex-grass.png",
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

export async function getTexture(key: AssetKey) {
  const tex = (await getAsset(key)) as Texture;
  tex.source.scaleMode = "nearest";
  return tex;
}
