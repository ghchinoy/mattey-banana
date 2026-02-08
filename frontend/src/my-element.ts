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
      <about-dialog 
        ?open=${this.showAbout} 
        @close=${() => this.showAbout = false}
      ></about-dialog>

      <main class="container">
        <div class="header">
          <div class="brand">MATTEY-BANANA</div>
          <div style="flex-grow: 1"></div>
          <div class="header-links">
            <div class="tagline">
              AI TO VECTOR GENERATOR
              <a href="https://github.com/ghchinoy/mattey-banana" target="_blank">
                <img src="https://img.shields.io/github/stars/ghchinoy/mattey-banana?style=social" alt="GitHub stars">
              </a>
              <button class="help-btn" @click=${() => this.showAbout = true}>?</button>
            </div>
            <a class="header-link" href="https://github.com/ghchinoy/mattey-banana" target="_blank">GitHub</a>
            <a class="header-link" href="#" @click=${(e: Event) => { e.preventDefault(); this.showAbout = true; }}>About</a>
          </div>
        </div>

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
      font-family: system-ui, -apple-system, sans-serif;
      display: block;
      min-height: 100vh;
      color: var(--md-sys-color-on-surface);
      background-color: var(--md-sys-color-surface);
      --accent: var(--md-sys-color-primary);
      --border: var(--md-sys-color-outline-variant);
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: baseline; 
      border-bottom: 1px solid var(--border); 
      padding-bottom: 0.5rem; 
      margin-bottom: 2rem; 
    }

    .brand { 
      font-size: 1.2rem; 
      font-weight: bold; 
      letter-spacing: -0.02rem;
      color: var(--md-sys-color-on-surface);
    }

    .tagline { 
      font-size: 0.8rem; 
      color: var(--md-sys-color-on-surface-variant); 
      display: flex; 
      align-items: center; 
      gap: 0.5rem; 
    }

    .header-links { 
      display: flex; 
      align-items: baseline; 
      gap: 1.25rem; 
    }

    .header-link { 
      font-size: 0.75rem; 
      color: var(--accent); 
      text-decoration: none; 
      text-transform: uppercase; 
      letter-spacing: 0.05rem; 
    }

    .header-link:hover { 
      text-decoration: underline; 
    }

    .help-btn {
      background: none; 
      border: 1px solid var(--border); 
      color: var(--md-sys-color-on-surface-variant);
      border-radius: 50%; 
      width: 18px; 
      height: 18px; 
      font-size: 0.6rem;
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      transition: 0.2s;
    }

    .help-btn:hover { 
      border-color: var(--accent); 
      color: var(--accent); 
    }

    .card {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
      border-radius: 8px;
      background-color: var(--md-sys-color-surface-container-low);
      border: 1px solid var(--border);
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
