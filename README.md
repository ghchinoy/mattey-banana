# 🍌 Mattey Banana

**AI to vector generator**

Mattey Banana is a specialized web application designed to bridge the gap between generative AI and physical craftsmanship. It converts AI-generated imagery into clean, optimized vector paths (SVG/DXF), specifically tuned for legacy CNC hardware like the Fletcher-Terry F-6100 matte cutter.

![Monstera Sample](frontend/public/samples/gemini_20260207192859_0.png)
*From AI Prompt to Vector Outline*

## 🚀 Features

-   **Vector-Ready AI Prompts:** Integrated Prompt Assistant helps users craft high-contrast, zero-noise imagery perfect for tracing.
-   **Rust-Powered WASM Engine:** High-performance `vtracer` (visioncortex) engine providing high-fidelity tracing with support for both polygons and Bézier splines.
-   **Contour Hierarchy:** Advanced path discovery that correctly identifies and handles internal holes and nested shapes.
-   **Path Simplification & Denoising:** Adjustable noise filtering ("turd" removal) and path smoothing to ensure clean, efficient vectors.
-   **Dual Tracing Modes:** 
    -   **CNC Optimized:** Generates dense `LwPolyline` DXF files ideal for legacy Windows 98-era plotters like the Fletcher-Terry F-6100.
    -   **Web / AI Optimized:** Generates semantic, low-complexity SVGs built with true Cubic Bézier (`C`) splines, perfect for animation tools like **MorphLab**.
-   **Real-time Preview:** Adjust threshold, noise, smoothing, and trace mode settings with instant visual feedback right in the browser.

## 🛠 Tech Stack

-   **Frontend:** [Lit](https://lit.dev/) WebComponents & [Material 3](https://m3.material.io/)
-   **State Management:** [Preact Signals](https://github.com/preactjs/signals)
-   **Persistence:** [idb](https://github.com/jakearchibald/idb) (IndexedDB wrapper)
-   **Backend (Core Logic):** [Rust](https://www.rust-lang.org/) compiled to [WebAssembly](https://webassembly.org/)
-   **AI:** Gemini Nano Banana Pro (Image Generation)

## ⚠️ Is this tool right for you? (The CNC Overhead)

Mattey Banana is a **hybrid** tool built to solve a specific problem: bridging modern generative AI with legacy CNC plotters (like the Fletcher-Terry F-6100). 

Because legacy hardware requires dense, flattened polylines (`DXF` format) instead of modern Bézier curves, this application carries architectural overhead. The Rust/WASM core includes mathematical libraries to perform on-the-fly curve flattening and intermediate representation (IR) parsing.

**If your ONLY goal is to convert PNGs to SVGs for the web:**
This project is likely over-engineered for your needs. The requirement to compile Rust to WebAssembly (`wasm-bindgen`) adds complexity to the build process. 

Instead of this WASM approach, you might want to consider **pure JavaScript alternatives** (such as [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs) or JS ports of `potrace`). Pure JS solutions:
- Require zero build steps (no `cargo`, no WASM toolchain).
- Can be dropped directly into any web project.
- Are perfectly adequate for standard web SVG generation.

*However*, if you need blisteringly fast tracing, high-fidelity Bézier splines (via the `vtracer` engine), or need to drive physical CNC hardware, Mattey Banana's Rust engine is exactly what you're looking for!

## 📦 Getting Started

### Prerequisites
-   Node.js & npm
-   Rust & `wasm-bindgen-cli`

### Installation

1.  **Clone the repo**
2.  **Build the WASM module:**
    ```bash
    cd wasm
    cargo build --target wasm32-unknown-unknown
    wasm-bindgen target/wasm32-unknown-unknown/debug/matte_wasm.wasm --out-dir ../frontend/src/wasm --target web
    ```
3.  **Run the Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
4.  **Configure API Key:**
    Open the application in your browser and enter your Gemini API key in the **AI Assistant** tab. It will be securely stored in your browser's IndexedDB.

## 🌐 Deployment

This project is configured for **GitHub Pages**. Any push to the `main` branch will trigger a GitHub Action that:
1.  Compiles the Rust WASM module in `--release` mode.
2.  Packages the Lit frontend.
3.  Deploys the optimized assets to the project's GitHub Pages site.

## 🎨 Example Pipeline

| Stage | Output |
| :--- | :--- |
| **1. AI Generation** | A high-contrast PNG silhouette of a Monstera leaf. |
| **2. WASM Tracing** | Rust engine scans pixels and discovers closed-loop contours. |
| **3. Final Vector** | An optimized DXF/SVG ready for the matte cutter. |

## 📝 Roadmap

-   [ ] **Advanced Scaling:** User-defined DPI and physical dimension settings (inches/mm) for precise CNC cutting.
-   [ ] **DXF Bézier Support:** Investigate support for true `SPLINE` entities in DXF exports for modern plotters.
-   [ ] **Batch Processing:** Support for tracing and exporting multiple generated images at once.

---
Built with 💛 for the vector community.