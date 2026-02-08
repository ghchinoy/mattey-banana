import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { effect } from '@preact/signals-core'
import { appState } from './state'
import { getUserImages, saveUserImage } from './db'
import { generateImage } from './gemini'

import './prompt-assistant'
import './image-gallery'
import './vector-preview'
import './about-dialog'
import '@material/web/tabs/tabs.js'
import '@material/web/tabs/primary-tab.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/icon/icon.js'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  @state()
  private activeTab = 0;

  @state()
  private showAbout = false;

  constructor() {
    super();
    this._init();
    effect(() => {
      this.requestUpdate();
    });
  }

  private async _init() {
    await appState.init();
    const userImages = await getUserImages();
    if (userImages && userImages.length > 0) {
      userImages.forEach(img => appState.addImage(img));
    }
  }

  /**
   * Copy for the read the docs hint.
   */
  @property()
  docsHint = 'Click on the Vite and Lit logos to learn more'

  private async _handleGenerate(e: CustomEvent) {
    const { prompt, apiKey } = e.detail;
    appState.generating.value = true;
    this.activeTab = 0; // Switch to gallery immediately to show progress
    
    const placeholderId = `gen-${Date.now()}`;
    const placeholder: any = {
      id: placeholderId,
      url: '',
      prompt: prompt,
      loading: true
    };
    
    appState.images.value = [placeholder, ...appState.images.value];

    try {
      console.log('Starting image generation for:', prompt);
      const imageUrl = await generateImage(prompt, apiKey);
      console.log('Image generation successful, length:', imageUrl.length);

      const newImage = {
        id: placeholderId,
        url: imageUrl,
        prompt: prompt,
        loading: false
      };

      // Replace placeholder with real image by creating a fresh array reference
      const updatedImages = appState.images.value.map(img => 
        img.id === placeholderId ? newImage : img
      );
      appState.images.value = [...updatedImages];
      
      console.log('Updated appState.images, saving to DB...');
      await saveUserImage(newImage);
      
      // Explicitly trigger a small delay to let the DOM catch up if needed
      setTimeout(() => {
        appState.selectImage(newImage);
        console.log('Selected new image');
      }, 50);
    } catch (err: any) {
      console.error('Image generation failed:', err);
      // Remove placeholder on failure
      appState.images.value = appState.images.value.filter(img => img.id !== placeholderId);
      alert(`Failed to generate image: ${err.message}`);
    } finally {
      appState.generating.value = false;
    }
  }

  render() {
    return html`
      <header class="top-bar">
        <div class="logo-area">
          <span class="logo-emoji">🍌</span>
          <div class="title-stack">
            <h1>Mattey Banana</h1>
            <p class="tagline">AI to vector generator</p>
          </div>
        </div>
        <div class="actions">
          <md-icon-button href="https://github.com/ghchinoy/mattey-banana" target="_blank">
            <md-icon>code</md-icon>
          </md-icon-button>
          <md-icon-button @click=${() => this.showAbout = true}>
            <md-icon>help_outline</md-icon>
          </md-icon-button>
        </div>
      </header>

      <about-dialog 
        ?open=${this.showAbout} 
        @close=${() => this.showAbout = false}
      ></about-dialog>

      <main class="container">
        <div class="card">
          <md-tabs @change=${(e: any) => this.activeTab = e.target.activeTabIndex}>
            <md-primary-tab ?active=${this.activeTab === 0}>Gallery</md-primary-tab>
            <md-primary-tab ?active=${this.activeTab === 1}>AI Assistant</md-primary-tab>
          </md-tabs>

          <div class="tab-content">
            <div ?hidden=${this.activeTab !== 0}>
              <image-gallery></image-gallery>
            </div>
            <div ?hidden=${this.activeTab !== 1}>
              <prompt-assistant @generate=${this._handleGenerate}></prompt-assistant>
            </div>
          </div>

          <vector-preview></vector-preview>
        </div>
      </main>
    `
  }

  static styles = css`
    :host {
      font-family: Roboto, system-ui, sans-serif;
      display: block;
      min-height: 100vh;
      color: var(--md-sys-color-on-surface);
      background-color: var(--md-sys-color-surface);
    }

    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      background-color: var(--md-sys-color-surface-container);
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-emoji {
      font-size: 2rem;
    }

    .title-stack h1 {
      margin: 0;
      font-size: 1.25rem;
      color: var(--md-sys-color-primary);
    }

    .tagline {
      margin: 0;
      font-size: 0.75rem;
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.8;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
      border-radius: 28px;
      background-color: var(--md-sys-color-surface-container-low);
      box-shadow: var(--md-sys-elevation-level1);
    }

    .tab-content {
      margin-top: 0.5rem;
    }

    md-tabs {
      --md-tabs-container-color: transparent;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
