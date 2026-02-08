use wasm_bindgen::prelude::*;
use dxf::{Drawing, entities::{Entity, EntityType, LwPolyline}, LwPolylineVertex};
use vtracer::{Config, ColorMode, Hierarchical, ColorImage};
use visioncortex::PathSimplifyMode;

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {} from Rust WASM!", name)
}

#[wasm_bindgen]
pub fn trace_to_json(image_bytes: &[u8], threshold: u8, turd_size: usize, smoothing: f64, is_spline: bool) -> Result<String, JsValue> {
    let img = image::load_from_memory(image_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;
    
    let grayscale = img.to_luma8();
    let (width, height) = grayscale.dimensions();

    let mut config = Config::default();
    config.color_mode = ColorMode::Binary;
    config.filter_speckle = turd_size;
    config.mode = if is_spline { PathSimplifyMode::Spline } else { PathSimplifyMode::Polygon }; 
    config.hierarchical = Hierarchical::Stacked;
    config.length_threshold = smoothing;

    let mut pixels = Vec::new();
    for pixel in grayscale.pixels() {
        let val = if pixel.0[0] < threshold { 0 } else { 255 };
        pixels.push(val); pixels.push(val); pixels.push(val); pixels.push(255);
    }

    let v_img = ColorImage { pixels, width: width as usize, height: height as usize };

    let svg_file = vtracer::convert(v_img, config)
        .map_err(|e| JsValue::from_str(&format!("VTracer failed: {}", e)))?;
    let svg_str = format!("{}", svg_file);

    let mut paths: Vec<Vec<(f64, f64)>> = Vec::new();
    let doc = vsvg::Document::from_string(&svg_str, false)
        .map_err(|e| JsValue::from_str(&format!("VSVG failed to parse: {}", e)))?;

    for layer in doc.layers.values() {
        for path in &layer.paths {
            // For the JSON preview, we always flatten so the frontend can draw it easily
            // Tolerance of 0.1 provides a very accurate polyline representation
            for flattened in path.flatten(0.1) {
                let points: Vec<(f64, f64)> = flattened.data.points().iter().map(|p| (p.x(), p.y())).collect();
                if !points.is_empty() {
                    paths.push(points);
                }
            }
        }
    }

    serde_json::to_string(&paths).map_err(|e| JsValue::from_str(&e.to_string()))
}

#[wasm_bindgen]
pub fn trace_to_svg(image_bytes: &[u8], threshold: u8, turd_size: usize, smoothing: f64, is_spline: bool) -> Result<String, JsValue> {
    let img = image::load_from_memory(image_bytes)
        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;
    
    let grayscale = img.to_luma8();
    let (width, height) = grayscale.dimensions();

    let mut config = Config::default();
    config.color_mode = ColorMode::Binary;
    config.filter_speckle = turd_size;
    config.mode = if is_spline { PathSimplifyMode::Spline } else { PathSimplifyMode::Polygon }; 
    config.hierarchical = Hierarchical::Stacked;
    config.length_threshold = smoothing;

    let mut pixels = Vec::new();
    for pixel in grayscale.pixels() {
        let val = if pixel.0[0] < threshold { 0 } else { 255 };
        pixels.push(val); pixels.push(val); pixels.push(val); pixels.push(255);
    }

    let v_img = ColorImage { pixels, width: width as usize, height: height as usize };

    let svg_file = vtracer::convert(v_img, config)
        .map_err(|e| JsValue::from_str(&format!("VTracer failed: {}", e)))?;
    
    Ok(format!("{}", svg_file))
}

#[wasm_bindgen]
pub fn export_to_svg(paths_json: &str, width: f64, height: f64) -> Result<String, JsValue> {
    let paths: Vec<Vec<(f64, f64)>> = serde_json::from_str(paths_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    // Use evenodd fill rule for hierarchy support
    let mut svg = format!("<svg viewBox=\"0 0 {} {}\" xmlns=\"http://www.w3.org/2000/svg\">", width, height);
    let mut path_data = String::new();
    for path in paths {
        if path.is_empty() { continue; }
        path_data.push_str(&format!("M {} {} ", path[0].0, path[0].1));
        for i in 1..path.len() {
            path_data.push_str(&format!("L {} {} ", path[i].0, path[i].1));
        }
        path_data.push_str("Z ");
    }
    svg.push_str(&format!("<path d=\"{}\" fill=\"black\" fill-rule=\"evenodd\" stroke=\"none\" />", path_data));
    svg.push_str("</svg>");
    Ok(svg)
}

#[wasm_bindgen]
pub fn export_to_fletcher_dxf(paths_json: &str) -> Result<String, JsValue> {
    let paths: Vec<Vec<(f64, f64)>> = serde_json::from_str(paths_json)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let mut drawing = Drawing::new();
    let scale = 0.01; 

    for path in paths {
        let mut lw_poly = LwPolyline::default();
        for (x, y) in path {
            lw_poly.vertices.push(LwPolylineVertex {
                x: x * scale,
                y: y * scale,
                ..Default::default()
            });
        }
        let mut entity = Entity::new(EntityType::LwPolyline(lw_poly));
        entity.common.layer = "CUT".to_string(); 
        drawing.add_entity(entity);
    }

    let mut output = Vec::new();
    drawing.save(&mut output).map_err(|e| JsValue::from_str(&e.to_string()))?;
    Ok(String::from_utf8_lossy(&output).into_owned())
}