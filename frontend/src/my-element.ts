import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { effect } from '@preact/signals-core'
import { appState } from './state'

import './prompt-assistant'
import './image-gallery'
import './vector-preview'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  constructor() {
    super();
    appState.init();
    effect(() => {
      this.requestUpdate();
    });
  }

  /**
   * Copy for the read the docs hint.
   */
  @property()
  docsHint = 'Click on the Vite and Lit logos to learn more'

  private async _handleGenerate(e: CustomEvent) {
    const { prompt } = e.detail;
    appState.generating.value = true;
    
    console.log('Generating image for:', prompt);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    appState.addImage({
      id: Date.now().toString(),
      url: '/samples/gemini_20260207192859_0.png',
      prompt: prompt
    });

    appState.generating.value = false;
  }

  render() {
    return html`
      <div class="header">
        <h1>Mattey Banana</h1>
        <p>AI to vector generator</p>
      </div>

      <div class="card">
        <prompt-assistant @generate=${this._handleGenerate}></prompt-assistant>
        <image-gallery></image-gallery>
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
      gap: 2rem;
      padding: 2rem;
      border-radius: 24px;
      background-color: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface-variant);
      box-shadow: var(--md-sys-elevation-level1);
    }
    p {
      color: var(--md-sys-color-on-surface-variant);
      line-height: 1.5;
    }
    .read-the-docs {
      margin-top: 2rem;
      color: var(--md-sys-color-outline);
      text-align: center;
      font-size: 0.875rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
