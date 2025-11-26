import { create } from 'zustand';

export const useLayerStore = create((set) => ({
  visibleLayers: {
    'GTFS Stops': true,
    'GTFS Routes': true,
  },
  layerOrder: ['GTFS Stops', 'GTFS Routes'],
  gtfsData: null,

  setGtfsData: (data) => set({ gtfsData: data }),

  moveLayerUp: (layerName) =>
    set((state) => {
      const currentIndex = state.layerOrder.indexOf(layerName);
      if (currentIndex > 0) {
        const newOrder = [...state.layerOrder];
        [newOrder[currentIndex - 1], newOrder[currentIndex]] = [
          newOrder[currentIndex],
          newOrder[currentIndex - 1],
        ];
        return { layerOrder: newOrder };
      }
      return state;
    }),

  moveLayerDown: (layerName) =>
    set((state) => {
      const currentIndex = state.layerOrder.indexOf(layerName);
      if (currentIndex < state.layerOrder.length - 1) {
        const newOrder = [...state.layerOrder];
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
          newOrder[currentIndex + 1],
          newOrder[currentIndex],
        ];
        return { layerOrder: newOrder };
      }
      return state;
    }),

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
