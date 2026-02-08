import { signal } from '@preact/signals-core';
import initWasm from './wasm/matte_wasm.js';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export const appState = {
  wasmInitialized: signal(false),
  generating: signal(false),
  count: signal(0),
  images: signal<GeneratedImage[]>([
    {
      id: 'sample-1',
      url: '/samples/gemini_20260207192859_0.png',
      prompt: 'Sample Monstera Leaf'
    },
    {
      id: 'sample-2',
      url: '/samples/gemini_20260207195614_1.png',
      prompt: 'Art Deco Cat'
    },
    {
      id: 'sample-3',
      url: '/samples/gemini_20260207195622_1.png',
      prompt: 'Geometric Mandala'
    }
  ]),
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
