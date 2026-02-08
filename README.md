# 🍌 Mattey Banana

**AI to Vector Generator**

Mattey Banana is a specialized web application designed to bridge the gap between generative AI and physical craftsmanship. It converts AI-generated imagery into clean, optimized vector paths (SVG/DXF), specifically tuned for legacy CNC hardware like the Fletcher-Terry F-6100 matte cutter.

![Monstera Sample](frontend/public/samples/gemini_20260207192859_0.png)
*From AI Prompt to Vector Outline*

## 🚀 Features

-   **Vector-Ready AI Prompts:** Integrated Prompt Assistant helps users craft high-contrast, zero-noise imagery perfect for tracing.
-   **Rust-Powered WASM Engine:** High-performance Moore-Neighbor contour tracing implemented in Rust for precision path discovery.
-   **CNC Optimized:** Generates `LwPolyline` DXF files with manageable vertex counts, ideal for legacy Windows 98-era plotters.
-   **Real-time Preview:** Adjust threshold settings and see the vector paths update instantly in your browser.
-   **Dual Format Export:** Download your designs as **DXF (CNC)** or **SVG (Vector)**.

## 🛠 Tech Stack

-   **Frontend:** [Lit](https://lit.dev/) WebComponents & [Material 3](https://m3.material.io/)
-   **State Management:** [Preact Signals](https://github.com/preactjs/signals)
-   **Backend (Core Logic):** [Rust](https://www.rust-lang.org/) compiled to [WebAssembly](https://webassembly.org/)
-   **AI:** Gemini Nano Banana Pro (Image Generation)

## 📦 Getting Started

### Prerequisites
-   Node.js & npm
-   Rust & `wasm-bindgen-cli`

### Installation

1.  **Clone the repo**
2.  **Setup Environment:**
    Create a `frontend/.env` file based on `frontend/.env.example` and add your Gemini API key.
3.  **Build the WASM module:**
    ```bash
    cd wasm
    cargo build --target wasm32-unknown-unknown
    wasm-bindgen target/wasm32-unknown-unknown/debug/matte_wasm.wasm --out-dir ../frontend/src/wasm --target web
    ```
4.  **Run the Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

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

-   [ ] **Contour Hierarchy:** Support for filled shapes and internal "holes."
-   [ ] **RDP Simplification:** Implementation of Ramer-Douglas-Peucker to further reduce vertex counts.
-   [ ] **Advanced Scaling:** User-defined DPI and physical dimension settings.

---
Built with 💛 for the vector community.
