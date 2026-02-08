import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/button/filled-button.js';

import { effect } from '@preact/signals-core';
import { appState } from './state';
import '@material/web/progress/linear-progress.js';

@customElement('prompt-assistant')
export class PromptAssistant extends LitElement {
  @state()
  private prompt = '';

  constructor() {
    super();
    effect(() => {
      this.requestUpdate();
    });
  }
  
  private templates = [
    { label: 'Monstera', text: 'High contrast black and white silhouette of a Monstera leaf, minimal detail, vector style' },
    { label: 'Cat', text: 'Art Deco geometric cat outline, black and white, thick lines' },
    { label: 'Mandala', text: 'Simple geometric mandala pattern, black and white, vector ready' }
  ];

  private _applyTemplate(text: string) {
    this.prompt = text;
  }

  render() {
    const isGenerating = appState.generating.value;

    return html`
      <div class="assistant">
        <h3>Prompt Assistant</h3>
        
        <md-linear-progress .indeterminate=${isGenerating} ?hidden=${!isGenerating}></md-linear-progress>

        <md-chip-set>
          ${this.templates.map(t => html`
            <md-filter-chip label="${t.label}" ?disabled=${isGenerating} @click=${() => this._applyTemplate(t.text)}></md-filter-chip>
          `)}
        </md-chip-set>
        
        <md-outlined-text-field
          label="Your Prompt"
          type="textarea"
          .value=${this.prompt}
          ?disabled=${isGenerating}
          @input=${(e: any) => this.prompt = e.target.value}
          rows="3"
        ></md-outlined-text-field>

        <md-filled-button 
          ?disabled=${isGenerating || !this.prompt} 
          @click=${this._onGenerate}>
          ${isGenerating ? 'Generating...' : 'Generate Image'}
        </md-filled-button>
      </div>
    `;
  }

  private _onGenerate() {
    this.dispatchEvent(new CustomEvent('generate', {
      detail: { prompt: this.prompt },
      bubbles: true,
      composed: true
    }));
  }

  static styles = css`
    .assistant {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 12px;
      background: var(--md-sys-color-surface-container-low);
    }
    md-outlined-text-field {
      width: 100%;
    }
  `;
}
