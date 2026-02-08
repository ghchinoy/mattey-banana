import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { effect } from '@preact/signals-core';
import { appState } from './state';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';

@customElement('error-toast')
export class ErrorToast extends LitElement {
  constructor() {
    super();
    effect(() => {
      if (appState.errorMessage.value) {
        this._show();
      } else {
        this._hide();
      }
    });
  }

  private _show() {
    this.style.display = 'flex';
    setTimeout(() => {
      this.style.opacity = '1';
      this.style.transform = 'translateY(0)';
    }, 10);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      appState.errorMessage.value = null;
    }, 5000);
  }

  private _hide() {
    this.style.opacity = '0';
    this.style.transform = 'translateY(20px)';
    setTimeout(() => {
      this.style.display = 'none';
    }, 300);
  }

  render() {
    return html`
      <div class="toast">
        <md-icon>error_outline</md-icon>
        <div class="message">${appState.errorMessage.value}</div>
        <md-icon-button @click=${() => appState.errorMessage.value = null}>
          <md-icon>close</md-icon>
        </md-icon-button>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: none;
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      z-index: 1000;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: system-ui, -apple-system, sans-serif;
    }

    .toast {
      background-color: var(--md-sys-color-error-container);
      color: var(--md-sys-color-on-error-container);
      padding: 0.5rem 1rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--md-sys-elevation-level3);
      min-width: 300px;
      max-width: 90vw;
    }

    .message {
      flex-grow: 1;
      font-size: 0.9rem;
      font-weight: 500;
    }

    md-icon {
      --md-icon-size: 24px;
    }

    md-icon-button {
      --md-icon-button-icon-color: var(--md-sys-color-on-error-container);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'error-toast': ErrorToast;
  }
}
