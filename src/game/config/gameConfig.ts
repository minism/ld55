const gameConfig = {
  tileSize: 16,
  overlayGridColor: 0xffffff,
  overlayGridAlpha: 0.05,
  defaultRenderScale: 2,
  panelPadding: 16,
  gameViewVerticalPadding: 100,

  generation: {
    worldSize: 15,
    numForestPatches: 3,
    numWatcherPatches: 2,
    forestPatchSizeMin: 4,
    forestPatchSizeMax: 12,
    waterPatchSizeMin: 3,
    waterPatchSizeMax: 6,
  },
};

export default gameConfig;
