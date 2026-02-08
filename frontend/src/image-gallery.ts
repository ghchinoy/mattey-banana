import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { effect } from '@preact/signals-core';
import { appState } from './state';

@customElement('image-gallery')
export class ImageGallery extends LitElement {
  constructor() {
    super();
    effect(() => {
      this.requestUpdate();
    });
  }

  render() {
    return html`
      <div class="gallery">
        ${appState.images.value.map(img => html`
          <div class="item ${appState.selectedImage.value?.id === img.id ? 'selected' : ''}" 
               @click=${() => appState.selectImage(img)}>
            <img src="${img.url}" alt="${img.prompt}">
          </div>
        `)}
      </div>
    `;
  }

  static styles = css`
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .item {
      cursor: pointer;
      border: 4px solid transparent;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--md-sys-elevation-level1);
    }
    .item:hover {
      transform: translateY(-4px);
      box-shadow: var(--md-sys-elevation-level2);
      border-color: var(--md-sys-color-primary-container);
    }
    .item.selected {
      border-color: var(--md-sys-color-primary);
      transform: scale(1.05);
      box-shadow: var(--md-sys-elevation-level3);
      z-index: 1;
    }
    img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      display: block;
    }
  `;
}
