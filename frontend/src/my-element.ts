import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { effect } from '@preact/signals-core'
import { appState } from './state'
import { getUserImages, saveUserImage } from './db'
import { generateImage } from './gemini'

import './prompt-assistant'
import './image-gallery'
import './vector-preview'
import '@material/web/tabs/tabs.js'
import '@material/web/tabs/primary-tab.js'

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
    
    try {
      console.log('Generating image for:', prompt);
      
      const imageUrl = await generateImage(prompt, apiKey);

      const newImage = {
        id: `gen-${Date.now()}`,
        url: imageUrl,
        prompt: prompt
      };

      appState.addImage(newImage);
      await saveUserImage(newImage);
      appState.selectImage(newImage);

      this.activeTab = 0; // Switch back to gallery
    } catch (err: any) {
      console.error('Image generation failed:', err);
      alert(`Failed to generate image: ${err.message}`);
    } finally {
      appState.generating.value = false;
    }
  }

  render() {
    return html`
      <div class="header">
        <h1>Mattey Banana</h1>
        <p>AI to vector generator</p>
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
    `
  }

  static styles = css`
    :host {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: Roboto, system-ui, sans-serif;
      display: block;
      color: var(--md-sys-color-on-surface);
      background-color: var(--md-sys-color-surface);
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    h1 {
      margin: 0;
      color: var(--md-sys-color-primary);
      font-size: 3rem;
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
      border-radius: 24px;
      background-color: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface-variant);
      box-shadow: var(--md-sys-elevation-level1);
    }
    .tab-content {
      margin-top: 0.5rem;
    }
    p {
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.5;
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

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
