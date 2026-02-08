import { LitElement, html, css, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { effect } from '@preact/signals-core';
import { appState } from './state';
import { trace_to_json, export_to_fletcher_dxf } from './wasm/matte_wasm.js';

@customElement('vector-preview')
export class VectorPreview extends LitElement {
  @state()
  private paths: [number, number][][] = [];

  @state()
  private threshold = 128;

  constructor() {
    super();
    effect(() => {
      const selected = appState.selectedImage.value;
      if (selected) {
        this._updatePreview(selected.url);
      }
    });
  }

  private async _updatePreview(url: string) {
    try {
      const resp = await fetch(url);
      const bytes = await resp.arrayBuffer();
      const json = trace_to_json(new Uint8Array(bytes), this.threshold);
      this.paths = JSON.parse(json);
    } catch (e) {
      console.error('Tracing failed', e);
    }
  }

  private async _handleDownload() {
    if (this.paths.length === 0) return;
    const dxf = export_to_fletcher_dxf(JSON.stringify(this.paths));
    const blob = new Blob([dxf], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.dxf';
    a.click();
    URL.revokeObjectURL(url);
  }

  render() {
    if (!appState.selectedImage.value) {
      return html`<p>Select an image to preview vectors</p>`;
    }

    return html`
      <div class="preview-container">
        <h3>Vector Preview</h3>
        <svg viewBox="0 0 1024 1024">
          ${this.paths.map(path => svg`
            <polyline points="${path.map(p => p.join(',')).join(' ')}" 
                      fill="none" stroke="black" stroke-width="2" />
          `)}
        </svg>
        
        <div class="controls">
          <label>Threshold: ${this.threshold}</label>
          <input type="range" min="0" max="255" .value=${this.threshold} 
                 @input=${(e: any) => { this.threshold = e.target.value; this._updatePreview(appState.selectedImage.value!.url); }}>
          
          <md-filled-button @click=${this._handleDownload}>Download DXF</md-filled-button>
        </div>
      </div>
    `;
  }

  static styles = css`
    .preview-container {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid var(--md-sys-color-outline);
      border-radius: 12px;
    }
    svg {
      width: 100%;
      height: 300px;
      background: white;
      border: 1px solid #eee;
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }
  `;
}
