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

    let mut visited = vec![false; (width * height) as usize];



    // Proper Contour Tracing

    for y in 1..(height - 1) {

        for x in 1..(width - 1) {

            let idx = (y * width + x) as usize;

            if visited[idx] { continue; }



            let pixel = grayscale.get_pixel(x, y).0[0];

            if pixel < threshold {

                // Found a start point of a new contour

                let mut path = Vec::new();

                let (mut cur_x, mut cur_y) = (x, y);

                

                // Moore-Neighbor tracing (simplified)

                // We'll trace the boundary of the black segment

                let mut dir = 0; // 0: Right, 1: Down, 2: Left, 3: Up

                let start_x = x;

                let start_y = y;



                loop {

                    path.push((cur_x as f64, cur_y as f64));

                    visited[(cur_y * width + cur_x) as usize] = true;



                    // Check neighbors in circular order

                    let mut found_next = false;

                    for i in 0..4 {

                        let next_dir = (dir + 3 + i) % 4;

                        let (nx, ny) = match next_dir {

                            0 => (cur_x + 1, cur_y),

                            1 => (cur_x, cur_y + 1),

                            2 => (cur_x - 1, cur_y),

                            3 => (cur_x, cur_y - 1),

                            _ => (cur_x, cur_y),

                        };



                        if nx < width && ny < height && grayscale.get_pixel(nx, ny).0[0] < threshold {

                            cur_x = nx;

                            cur_y = ny;

                            dir = next_dir;

                            found_next = true;

                            break;

                        }

                    }



                    if !found_next || (cur_x == start_x && cur_y == start_y) || path.len() > 5000 {

                        break;

                    }

                }



                if path.len() > 10 { // Filter noise

                    paths.push(path);

                }

            }

        }

    }



    serde_json::to_string(&paths).map_err(|e| JsValue::from_str(&e.to_string()))

}





#[wasm_bindgen]

pub fn export_to_svg(paths_json: &str, width: f64, height: f64) -> Result<String, JsValue> {

    let paths: Vec<Vec<(f64, f64)>> = serde_json::from_str(paths_json)

        .map_err(|e| JsValue::from_str(&e.to_string()))?;



    let mut svg = format!("<svg viewBox=\"0 0 {} {}\" xmlns=\"http://www.w3.org/2000/svg\">", width, height);

    for path in paths {

        if path.is_empty() { continue; }

        let points = path.iter()

            .map(|(x, y)| format!("{},{}", x, y))

            .collect::<Vec<_>>()

            .join(" ");

        svg.push_str(&format!("<polyline points=\"{}\" fill=\"none\" stroke=\"black\" stroke-width=\"1\" />", points));

    }

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




