## Project Style & UX Mandates

- **Stack Preference:** Favor **Lit WebComponents**, **Preact Signals**, and **Material 3** over heavy frameworks like React. Use **IndexedDB** (via `idb`) for persistent local-only state (API keys, images).
- **Accessibility (A11Y):** Rigorously use Material 3 design tokens (e.g., `--md-sys-color-surface`) for all custom containers. Ensure high-contrast ratios (WCAG 2.1) between text and backgrounds.
- **Hosting Compatibility:** Always use **relative paths** for internal assets and script references in `index.html` and code to ensure compatibility with GitHub Pages subpath hosting.
- **Vector Pipeline:** Maintain a dual-path pipeline: use high-resolution flattened polylines for the browser preview, but leverage direct high-fidelity exports (e.g., Bézier curves in SVG) for final downloads.
- **Expectation Management:** When implementing complex algorithms (like WASM tracing), clearly label UI outputs as "STUB" or "PLACEHOLDER" if the real logic is not yet complete.
- **WASM Workflow:** Always check host `wasm-bindgen` CLI version and match it exactly in `Cargo.toml`.
- **Branding:** Maintain the "Mattey Banana" branding and "AI to vector generator" tagline across all documentation and UI components.