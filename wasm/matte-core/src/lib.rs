use dxf::{Drawing, entities::{Entity, EntityType, LwPolyline}, LwPolylineVertex};
use vtracer::{Config, ColorMode, Hierarchical, ColorImage};
use visioncortex::PathSimplifyMode;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct PathIsland {
    pub id: String,
    pub svg_path_data: String,
}

pub fn trace_to_json_core(image_bytes: &[u8], threshold: u8, turd_size: usize, smoothing: f64, is_spline: bool) -> Result<String, String> {
    let img = image::load_from_memory(image_bytes)
        .map_err(|e| format!("Failed to load image: {}", e))?;
    
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
        .map_err(|e| format!("VTracer failed: {}", e))?;
    let svg_str = format!("{}", svg_file);

    let doc = roxmltree::Document::parse(&svg_str)
        .map_err(|e| format!("Failed to parse VTracer SVG output: {}", e))?;

    let mut islands = Vec::new();
    for (i, node) in doc.descendants().filter(|n| n.has_tag_name("path")).enumerate() {
        if let Some(d) = node.attribute("d") {
            islands.push(PathIsland {
                id: format!("island_{}", i),
                svg_path_data: d.to_string(),
            });
        }
    }

    serde_json::to_string(&islands).map_err(|e| e.to_string())
}

pub fn trace_to_svg_core(image_bytes: &[u8], threshold: u8, turd_size: usize, smoothing: f64, is_spline: bool) -> Result<String, String> {
    // We can just call trace_to_json_core and map it to an SVG here if needed
    // However, keeping the direct conversion is also fine.
    let img = image::load_from_memory(image_bytes)
        .map_err(|e| format!("Failed to load image: {}", e))?;
    
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
        .map_err(|e| format!("VTracer failed: {}", e))?;
    
    Ok(format!("{}", svg_file))
}

pub fn export_to_svg_core(paths_json: &str, width: f64, height: f64) -> Result<String, String> {
    let islands: Vec<PathIsland> = serde_json::from_str(paths_json)
        .map_err(|e| e.to_string())?;

    // Use evenodd fill rule for hierarchy support and emit individual paths
    let mut svg = format!("<svg viewBox=\"0 0 {} {}\" xmlns=\"http://www.w3.org/2000/svg\">\n", width, height);
    for island in islands {
        svg.push_str(&format!("  <path id=\"{}\" d=\"{}\" fill=\"#000000\" fill-rule=\"evenodd\" stroke=\"none\" />\n", island.id, island.svg_path_data));
    }
    svg.push_str("</svg>");
    Ok(svg)
}

pub fn export_to_fletcher_dxf_core(paths_json: &str) -> Result<String, String> {
    use kurbo::{BezPath, PathEl, Shape};

    let islands: Vec<PathIsland> = serde_json::from_str(paths_json)
        .map_err(|e| e.to_string())?;

    let mut drawing = Drawing::new();
    let scale = 0.01; 

    for island in islands {
        if let Ok(bez_path) = BezPath::from_svg(&island.svg_path_data) {
            let mut current_poly = LwPolyline::default();
            
            bez_path.flatten(0.1, |el| {
                match el {
                    PathEl::MoveTo(p) => {
                        if !current_poly.vertices.is_empty() {
                            let mut entity = Entity::new(EntityType::LwPolyline(current_poly.clone()));
                            entity.common.layer = "CUT".to_string(); 
                            drawing.add_entity(entity);
                            current_poly = LwPolyline::default();
                        }
                        current_poly.vertices.push(LwPolylineVertex {
                            x: p.x * scale,
                            y: p.y * scale,
                            ..Default::default()
                        });
                    },
                    PathEl::LineTo(p) => {
                        current_poly.vertices.push(LwPolylineVertex {
                            x: p.x * scale,
                            y: p.y * scale,
                            ..Default::default()
                        });
                    },
                    PathEl::ClosePath => {
                        current_poly.set_is_closed(true);
                        if !current_poly.vertices.is_empty() {
                            let mut entity = Entity::new(EntityType::LwPolyline(current_poly.clone()));
                            entity.common.layer = "CUT".to_string(); 
                            drawing.add_entity(entity);
                            current_poly = LwPolyline::default();
                        }
                    },
                    _ => {} // CurveTo, QuadTo won't happen because we flattened
                }
            });

            // flush any remaining open polyline
            if !current_poly.vertices.is_empty() {
                let mut entity = Entity::new(EntityType::LwPolyline(current_poly));
                entity.common.layer = "CUT".to_string(); 
                drawing.add_entity(entity);
            }
        }
    }

    let mut output = Vec::new();
    drawing.save(&mut output).map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output).into_owned())
}
