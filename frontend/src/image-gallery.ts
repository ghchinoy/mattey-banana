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
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .item:hover {
      border-color: var(--md-sys-color-primary-container);
    }
    .item.selected {
      border-color: var(--md-sys-color-primary);
    }
    img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }
  `;
}
