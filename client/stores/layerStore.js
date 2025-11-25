import { create } from 'zustand';

export const useLayerStore = create((set) => ({
  visibleLayers: {
    'Layer 1': true,
    'Layer 2': false,
    Traffic: true,
    'Sublayer 1.1': true,
    'Sublayer 1.2': true,
    'Sublayer 2.1': true,
    'Sublayer 2.2': true,
    'Sublayer 2.3': true,
    Congestion: true,
    Incidents: true,
  },
  gtfsData: null,

  setGtfsData: (data) => set({ gtfsData: data }),

  toggleVisibility: (layerName, sublayers = []) =>
    set((state) => {
      const newVisibility = !state.visibleLayers[layerName];
      const newLayerState = { ...state.visibleLayers, [layerName]: newVisibility };

      if (sublayers && sublayers.length > 0) {
        sublayers.forEach((sub) => {
          newLayerState[sub] = newVisibility;
        });
      }

      return { visibleLayers: newLayerState };
    }),
}));
