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
cargo build -p matte-wasm --target wasm32-unknown-unknown
wasm-bindgen target/wasm32-unknown-unknown/debug/matte_wasm.wasm --out-dir ../frontend/src/wasm --target web
```

This generates the following files in `frontend/src/wasm`:
- `matte_wasm.js`: The JavaScript glue code.
- `matte_wasm_bg.wasm`: The binary WASM module.
- `matte_wasm.d.ts`: TypeScript definitions.

## Data Interface

### `trace_to_json(image_bytes: &[u8], threshold: u8, turd_size: usize, smoothing: f64, is_spline: bool) -> Result<String, JsValue>`
Converts a binary image (PNG/JPG) into a JSON string representing vector paths.
- **Input**:
  - `image_bytes`: Raw bytes of the image file.
  - `threshold`: Brightness threshold (0-255).
  - `turd_size`: Noise filter (minimum area of a path in pixels).
  - `smoothing`: Simplification threshold (length threshold for path points).
  - `is_spline`: If `true`, uses Bézier splines; if `false`, uses straight-line polygons.
- **Output**: JSON string: `[[[x1, y1], [x2, y2], ...], ...]` (an array of flattened paths for preview).

### `trace_to_svg(image_bytes: &[u8], threshold: u8, turd_size: usize, smoothing: f64, is_spline: bool) -> Result<String, JsValue>`
Traces the image and returns a high-fidelity SVG string directly from the `vtracer` engine. Supports splines if `is_spline` is true.

### `export_to_svg(paths_json: &str, width: f64, height: f64) -> Result<String, JsValue>`
Generates a string containing valid SVG XML using the `evenodd` fill rule to support contour hierarchies.

### `export_to_fletcher_dxf(paths_json: &str) -> Result<String, JsValue>`
Generates a string containing DXF (AutoCAD) data formatted specifically for Fletcher-compatible CNC machines. Currently flattens all paths to `LwPolyline` entities.

## Extending the Module

When adding new functions to `wasm/src/lib.rs`, ensure they are marked with `#[wasm_bindgen]`. If you change the data structure returned by `trace_to_json`, update the corresponding TypeScript types in `frontend/src/vector-preview.ts`.

## Versioning Policy

We strictly lock `wasm-bindgen` to ensure compatibility between the Rust compiler and the JS glue code. Do not upgrade `wasm-bindgen` in `Cargo.toml` without verifying the host environment supports the new version.
