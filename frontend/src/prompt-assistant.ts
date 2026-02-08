import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/button/filled-button.js';

@customElement('prompt-assistant')
export class PromptAssistant extends LitElement {
  @state()
  private prompt = '';

  private templates = [
    { label: 'Organic', text: 'High-contrast black and white stencil of a [SUBJECT], solid black silhouette on a pure white background, clean continuous outlines, no shading, minimal internal detail, vector style.' },
    { label: 'Geometric', text: 'Geometric Art Deco [SUBJECT], thick black lines on white background, symmetrical patterns, interconnected paths suitable for a CNC plotter, no textures, high resolution.' },
    { label: 'Text', text: 'Stylized word "[SUBJECT]" in a bold stencil font where all letters are connected, thick lines, pure black and white, no drop shadows, centered on a white canvas.' }
  ];

  private _applyTemplate(text: string) {
    this.prompt = text;
  }

  render() {
    return html`
      <div class="assistant">
        <h3>Prompt Assistant</h3>
        <md-chip-set>
          ${this.templates.map(t => html`
            <md-filter-chip label="${t.label}" @click=${() => this._applyTemplate(t.text)}></md-filter-chip>
          `)}
        </md-chip-set>
        
        <md-outlined-text-field
          label="Your Prompt"
          type="textarea"
          .value=${this.prompt}
          @input=${(e: any) => this.prompt = e.target.value}
          rows="3"
        ></md-outlined-text-field>

        <md-filled-button @click=${this._onGenerate}>Generate Image</md-filled-button>
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
