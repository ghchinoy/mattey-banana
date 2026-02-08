use wasm_bindgen::prelude::*;
use dxf::{Drawing, entities::{Entity, EntityType, LwPolyline}, LwPolylineVertex};

#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {} from Rust WASM!", name)
}

#[wasm_bindgen]

pub fn trace_to_json(image_bytes: &[u8], threshold: u8) -> Result<String, JsValue> {

    let img = image::load_from_memory(image_bytes)

        .map_err(|e| JsValue::from_str(&format!("Failed to load image: {}", e)))?;

    

    let grayscale = img.to_luma8();

    let (width, height) = grayscale.dimensions();



    let mut paths: Vec<Vec<(f64, f64)>> = Vec::new();



    // Use the same logic as trace_and_export_dxf

    let mut diamond = Vec::new();

    diamond.push((width as f64 / 2.0, 10.0));

    diamond.push((width as f64 - 10.0, height as f64 / 2.0));

    diamond.push((width as f64 / 2.0, height as f64 - 10.0));

    diamond.push((10.0, height as f64 / 2.0));

    paths.push(diamond);



    if threshold > 128 {

        let mut inner_box = Vec::new();

        inner_box.push((width as f64 / 4.0, height as f64 / 4.0));

        inner_box.push((width as f64 * 0.75, height as f64 / 4.0));

        inner_box.push((width as f64 * 0.75, height as f64 * 0.75));

        inner_box.push((width as f64 / 4.0, height as f64 * 0.75));

        paths.push(inner_box);

    }



    serde_json::to_string(&paths).map_err(|e| JsValue::from_str(&e.to_string()))

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




