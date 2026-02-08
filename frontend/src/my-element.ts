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

  private _handleGenerate(e: CustomEvent) {
    const { prompt } = e.detail;
    console.log('Generating image for:', prompt);
    appState.addImage({
      id: Date.now().toString(),
      url: '/samples/gemini_20260207192859_0.png',
      prompt: prompt
    });
  }

  render() {
    return html`
      <div class="header">
        <h1>Mattey Banana DXF</h1>
        <p>AI to CNC Path Generator</p>
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
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    h1 {
      margin: 0;
      color: var(--md-sys-color-primary);
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
