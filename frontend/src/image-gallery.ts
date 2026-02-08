import { LitElement, html, css } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { effect } from '@preact/signals-core';
import { appState } from './state';
import { saveUserImage } from './db';
import '@material/web/icon/icon.js';

@customElement('image-gallery')
export class ImageGallery extends LitElement {
  @query('#file-input')
  private fileInput!: HTMLInputElement;

  constructor() {
    super();
    effect(() => {
      this.requestUpdate();
    });
  }

  private async _handleUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const url = event.target?.result as string;
      const newImage = {
        id: `user-${Date.now()}`,
        url,
        prompt: `Uploaded: ${file.name}`
      };
      
      appState.addImage(newImage);
      await saveUserImage(newImage);
      appState.selectImage(newImage);
    };
    reader.readAsDataURL(file);
  }

  render() {
    return html`
      <div class="gallery">
        <div class="item upload-tile" @click=${() => this.fileInput.click()}>
          <div class="upload-content">
            <md-icon>upload</md-icon>
            <span>Upload Image</span>
          </div>
          <input type="file" id="file-input" hidden accept="image/*" @change=${this._handleUpload}>
        </div>

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
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }
    .item {
      cursor: pointer;
      border: 4px solid transparent;
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--md-sys-elevation-level1);
      height: 140px;
      position: relative;
    }
    .upload-tile {
      border: 2px dashed var(--md-sys-color-outline-variant);
      background: var(--md-sys-color-surface-container-high);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: none;
    }
    .upload-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--md-sys-color-on-surface-variant);
      font-size: 0.8rem;
      font-weight: 500;
    }
    .item:hover {
      transform: translateY(-4px);
      box-shadow: var(--md-sys-elevation-level2);
      border-color: var(--md-sys-color-primary-container);
    }
    .item.selected {
      border-color: var(--md-sys-color-primary);
      transform: scale(1.02);
      box-shadow: var(--md-sys-elevation-level3);
      z-index: 1;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  `;
}
