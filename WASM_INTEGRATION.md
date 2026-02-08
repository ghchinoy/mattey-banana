# WASM Integration Guide: matte-wasm

This document describes how to build, integrate, and extend the Rust-based WASM module used in the Mattey Banana project.

## Prerequisites

- [Rust](https://rustup.rs/) (edition 2021)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/installer/)
- **CRITICAL:** `wasm-bindgen` CLI version must match the crate version.
  - Current version: `0.2.106`
  - Check with: `wasm-bindgen --version`

## CI/CD Deployment

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automates the WASM build process. On every push to `main`, the workflow:
1.  Detects the `wasm-bindgen` version from `Cargo.lock`.
2.  Builds the Rust code with `--release`.
3.  Runs `wasm-bindgen` to generate the JS glue code.
4.  Builds the frontend and deploys to GitHub Pages.

## Build Pipeline

The WASM module is located in the `/wasm` directory. To build and package it for the frontend:

```bash
cd wasm
cargo build --target wasm32-unknown-unknown
wasm-bindgen target/wasm32-unknown-unknown/debug/matte_wasm.wasm --out-dir ../frontend/src/wasm --target web
```

This generates the following files in `frontend/src/wasm`:
- `matte_wasm.js`: The JavaScript glue code.
- `matte_wasm_bg.wasm`: The binary WASM module.
- `matte_wasm.d.ts`: TypeScript definitions.

## Data Interface

### `trace_to_json(image_bytes: &[u8], threshold: u8) -> String`
Converts a binary image (PNG/JPG) into a JSON string representing vector paths.
- **Input**: Raw bytes of the image file.
- **Output**: JSON string: `[[[x1, y1], [x2, y2], ...], ...]` (an array of paths, where each path is an array of points).

### `export_to_svg(paths_json: &str, width: f64, height: f64) -> String`
Generates a string containing valid SVG XML.

### `export_to_fletcher_dxf(paths_json: &str) -> String`
Generates a string containing DXF (AutoCAD) data formatted specifically for Fletcher-compatible CNC machines.

## Extending the Module

When adding new functions to `wasm/src/lib.rs`, ensure they are marked with `#[wasm_bindgen]`. If you change the data structure returned by `trace_to_json`, update the corresponding TypeScript types in `frontend/src/vector-preview.ts`.

## Versioning Policy

We strictly lock `wasm-bindgen` to ensure compatibility between the Rust compiler and the JS glue code. Do not upgrade `wasm-bindgen` in `Cargo.toml` without verifying the host environment supports the new version.
