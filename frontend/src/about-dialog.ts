import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';

@customElement('about-dialog')
export class AboutDialog extends LitElement {
  @property({ type: Boolean }) open = false;

  render() {
    return html`
      <md-dialog 
        ?open=${this.open} 
        @closed=${() => this.dispatchEvent(new CustomEvent('close'))}
      >
        <div slot="headline">About Mattey Banana</div>
        <form slot="content" id="form-id" method="dialog">
          <section>
            <h3>Purpose</h3>
            <p>
              Mattey Banana is an <strong>AI to Vector</strong> workflow tool. 
              It allows you to generate high-contrast imagery using Gemini Nano Banana Pro 
              and convert them into precise CNC-ready vector paths (DXF/SVG) 
              using a high-performance Rust WASM engine.
            </p>
          </section>

          <section>
            <h3>Glossary</h3>
            <dl>
              <dt><strong>DXF (Drawing Exchange Format)</strong></dt>
              <dd>A CAD data file format used for compatibility between different programs. Essential for CNC machines.</dd>
              
              <dt><strong>LWPolyline</strong></dt>
              <dd>A "Lightweight Polyline" entity in DXF. It is more memory-efficient and preferred by legacy hardware like the Fletcher F-6100.</dd>
              
              <dt><strong>Threshold</strong></dt>
              <dd>The grayscale value (0-255) where a pixel is considered "black" vs "white" during the vectorization process.</dd>
              
              <dt><strong>Turd Size</strong></dt>
              <dd>A filter parameter that removes small noise segments ("speckles") from the resulting vector output.</dd>
              
              <dt><strong>Smoothing</strong></dt>
              <dd>Controls how much the tracing engine simplifies complex paths into cleaner segments.</dd>
            </dl>
          </section>
        </form>
        <div slot="actions">
          <md-text-button form="form-id" value="close">Close</md-text-button>
        </div>
      </md-dialog>
    `;
  }

  static styles = css`
    section {
      margin-bottom: 1.5rem;
    }
    h3 {
      color: var(--md-sys-color-primary);
      margin-top: 0;
    }
    p {
      line-height: 1.6;
      color: var(--md-sys-color-on-surface-variant);
    }
    dl {
      display: grid;
      grid-template-columns: auto;
      gap: 1rem;
    }
    dt {
      color: var(--md-sys-color-secondary);
    }
    dd {
      margin-left: 0;
      font-size: 0.9rem;
      color: var(--md-sys-color-on-surface-variant);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'about-dialog': AboutDialog;
  }
}
