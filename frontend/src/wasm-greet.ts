import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import init, { greet } from './wasm/matte_wasm.js';

@customElement('wasm-greet')
export class WasmGreet extends LitElement {
  @state()
  private message = 'WASM not loaded';

  async firstUpdated() {
    try {
      await init();
      this.message = 'WASM Loaded. Ready to greet.';
    } catch (e) {
      console.error('Failed to load WASM', e);
      this.message = 'WASM Load Failed';
    }
  }

  private _handleGreet() {
    this.message = greet('User');
  }

  render() {
    return html`
      <div class="container">
        <p>${this.message}</p>
        <md-filled-button @click=${this._handleGreet}>Greet from Rust</md-filled-button>
      </div>
    `;
  }

  static styles = css`
    .container {
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 8px;
      margin: 1rem 0;
    }
  `;
}
