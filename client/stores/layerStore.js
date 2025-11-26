import { create } from 'zustand';

export const useLayerStore = create((set) => ({
  visibleLayers: {
    'GTFS Stops': true,
  },
  gtfsData: null,

  setGtfsData: (data) => set({ gtfsData: data }),

  toggleVisibility: (layerName, sublayers = []) =>
    set((state) => {
      const newLayerState = { ...state.visibleLayers };

      // If it's a parent layer with sublayers, toggle all sublayers
      if (sublayers && sublayers.length > 0) {
        const allSublayersVisible = sublayers.every((sub) => state.visibleLayers[sub]);
        const newVisibility = !allSublayersVisible;
        sublayers.forEach((sub) => {
          newLayerState[sub] = newVisibility;
        });
      } else {
        // Toggle individual sublayer
        newLayerState[layerName] = !state.visibleLayers[layerName];
      }

      return { visibleLayers: newLayerState };
    }),

  isParentLayerVisible: (sublayers) => (state) => {
    return sublayers.some((sub) => state.visibleLayers[sub]);
  },
}));
