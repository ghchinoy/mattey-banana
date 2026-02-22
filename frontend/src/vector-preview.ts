import { LitElement, html, css, svg } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { effect } from '@preact/signals-core';
import { appState } from './state';
import { trace_to_json, export_to_fletcher_dxf, export_to_svg } from './wasm/matte_wasm.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';

interface PathIsland {
  id: string;
  svg_path_data: string;
}

@customElement('vector-preview')
export class VectorPreview extends LitElement {
  @state()
  private islands: PathIsland[] = [];

  @state()
  private format: 'dxf' | 'svg' = 'dxf';

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
      const settings = appState.tracingSettings.value;
      const json = trace_to_json(
        new Uint8Array(bytes), 
        settings.threshold,
        settings.turdSize,
        settings.smoothing,
        settings.mode === 'graphic'
      );
      this.islands = JSON.parse(json);
    } catch (e) {
      console.error('Tracing failed', e);
    }
  }

  private async _handleDownload() {
    const selected = appState.selectedImage.value;
    if (!selected || this.islands.length === 0) return;
    
    let content: string;
    let filename: string;
    let type: string;

    if (this.format === 'dxf') {
      content = export_to_fletcher_dxf(JSON.stringify(this.islands));
      filename = 'design.dxf';
      type = 'application/dxf';
    } else {
      content = export_to_svg(JSON.stringify(this.islands), 1024, 1024);
      filename = 'design.svg';
      type = 'image/svg+xml';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  render() {
    if (!appState.selectedImage.value) {
      return html`<p class="empty-state">Select an image to preview vectors</p>`;
    }

    const settings = appState.tracingSettings.value;

    return html`
      <div class="preview-container">
        <h3>Vector Preview</h3>
        <div class="svg-frame">
          <svg viewBox="0 0 1024 1024">
            ${this.islands.map(island => svg`
              <path id="${island.id}" d="${island.svg_path_data}" 
                    fill="none" stroke="black" stroke-width="2" />
            `)}
          </svg>
        </div>
        
        <div class="controls">
          <div class="control-group">
            <md-outlined-select label="Trace Mode" 
              @change=${(e: any) => {
                appState.tracingSettings.value = { ...settings, mode: e.target.value };
                this._updatePreview(appState.selectedImage.value!.url);
              }}>
              <md-select-option value="cnc" ?selected=${settings.mode === 'cnc'}>
                <div slot="headline">CNC (Polylines)</div>
                <div slot="supporting-text">Straight lines only, high vertex count.</div>
              </md-select-option>
              <md-select-option value="graphic" ?selected=${settings.mode === 'graphic'}>
                <div slot="headline">Graphic (Splines)</div>
                <div slot="supporting-text">Smooth Bézier curves, smaller file size.</div>
              </md-select-option>
            </md-outlined-select>
          </div>

          <div class="control-group">
            <label>Threshold (Detail): ${settings.threshold}</label>
            <input type="range" min="0" max="255" .value=${settings.threshold} 
                   @input=${(e: any) => { 
                     appState.tracingSettings.value = { ...settings, threshold: parseInt(e.target.value) };
                     this._updatePreview(appState.selectedImage.value!.url); 
                   }}>
          </div>

          <div class="control-group">
            <label>Filter Noise (Turd Size): ${settings.turdSize}</label>
            <input type="range" min="0" max="100" .value=${settings.turdSize} 
                   @input=${(e: any) => { 
                     appState.tracingSettings.value = { ...settings, turdSize: parseInt(e.target.value) };
                     this._updatePreview(appState.selectedImage.value!.url); 
                   }}>
          </div>

          <div class="control-group">
            <label>Smoothing: ${settings.smoothing.toFixed(1)}</label>
            <input type="range" min="0" max="10" step="0.5" .value=${settings.smoothing} 
                   @input=${(e: any) => { 
                     appState.tracingSettings.value = { ...settings, smoothing: parseFloat(e.target.value) };
                     this._updatePreview(appState.selectedImage.value!.url); 
                   }}>
          </div>
          
          <div class="format-selection">
            <md-tabs @change=${(e: any) => this.format = e.target.activeTabIndex === 0 ? 'dxf' : 'svg'}>
              <md-primary-tab>DXF (CNC)</md-primary-tab>
              <md-primary-tab>SVG (Vector)</md-primary-tab>
            </md-tabs>
          </div>

          <md-filled-button @click=${this._handleDownload}>
            Download ${this.format.toUpperCase()}
          </md-filled-button>
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .empty-state {
      text-align: center;
      padding: 3rem;
      border: 2px dashed var(--md-sys-color-outline-variant);
      border-radius: 16px;
      color: var(--md-sys-color-on-surface-variant);
    }
    .preview-container {
      padding: 1.5rem;
      border: 1px solid var(--md-sys-color-outline-variant);
      border-radius: 24px;
      background: var(--md-sys-color-surface-container-low);
    }
    .svg-frame {
      background: white;
      border-radius: 12px;
      padding: 1rem;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 1.5rem;
    }
    svg {
      width: 100%;
      height: 400px;
    }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .format-selection {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
    md-filled-button {
      width: 100%;
    }
    label {
      font-weight: 500;
      color: var(--md-sys-color-on-surface);
      font-size: 0.9rem;
    }
    input[type="range"] {
      width: 100%;
    }
  `;
}
