use wasm_bindgen::prelude::*;
use matte_core::*;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {} from Rust WASM!", name)
}

#[wasm_bindgen]
pub fn trace_to_json(image_bytes: &[u8], threshold: u8, turd_size: usize, smoothing: f64, is_spline: bool) -> Result<String, JsValue> {
    trace_to_json_core(image_bytes, threshold, turd_size, smoothing, is_spline)
        .map_err(|e| JsValue::from_str(&e))
}

#[wasm_bindgen]
pub fn trace_to_svg(image_bytes: &[u8], threshold: u8, turd_size: usize, smoothing: f64, is_spline: bool) -> Result<String, JsValue> {
    trace_to_svg_core(image_bytes, threshold, turd_size, smoothing, is_spline)
        .map_err(|e| JsValue::from_str(&e))
}

#[wasm_bindgen]
pub fn export_to_svg(paths_json: &str, width: f64, height: f64) -> Result<String, JsValue> {
    export_to_svg_core(paths_json, width, height)
        .map_err(|e| JsValue::from_str(&e))
}

#[wasm_bindgen]
pub fn export_to_fletcher_dxf(paths_json: &str) -> Result<String, JsValue> {
    export_to_fletcher_dxf_core(paths_json)
        .map_err(|e| JsValue::from_str(&e))
}
