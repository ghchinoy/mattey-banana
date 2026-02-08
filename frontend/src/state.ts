import { signal } from '@preact/signals-core';
import initWasm from './wasm/matte_wasm.js';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export const appState = {
  wasmInitialized: signal(false),
  count: signal(0),
  images: signal<GeneratedImage[]>([]),
  selectedImage: signal<GeneratedImage | null>(null),
  
  init: async () => {
    if (!appState.wasmInitialized.value) {
      await initWasm();
      appState.wasmInitialized.value = true;
    }
  },
  
  increment: () => {
    appState.count.value++;
  },

  addImage: (image: GeneratedImage) => {
    appState.images.value = [image, ...appState.images.value];
  },

  selectImage: (image: GeneratedImage) => {
    appState.selectedImage.value = image;
  }
};
