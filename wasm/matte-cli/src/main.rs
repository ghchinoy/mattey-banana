use clap::Parser;
use std::fs;
use std::path::PathBuf;

#[derive(Parser, Debug)]
#[command(author, version, about = "Mattey Banana CLI - Headless tracing tool", long_about = None)]
struct Args {
    /// Input image file path
    #[arg(short, long)]
    input: PathBuf,

    /// Output file path (e.g., out.dxf, out.svg, out.json)
    #[arg(short, long)]
    output: PathBuf,

    /// Tracing threshold (0-255)
    #[arg(long, default_value_t = 128)]
    threshold: u8,

    /// Filter noise/turd size
    #[arg(long, default_value_t = 10)]
    turd_size: usize,

    /// Path smoothing length threshold
    #[arg(long, default_value_t = 1.0)]
    smoothing: f64,

    /// Enable spline (Bézier) output for SVG mode
    #[arg(long, default_value_t = false)]
    is_spline: bool,
}

fn main() {
    let args = Args::parse();
    
    println!("Reading input image: {:?}", args.input);
    let image_bytes = fs::read(&args.input).expect("Failed to read input file");
    
    let ext = args.output.extension().unwrap_or_default().to_string_lossy().to_lowercase();
    
    match ext.as_str() {
        "json" => {
            let json = matte_core::trace_to_json_core(&image_bytes, args.threshold, args.turd_size, args.smoothing, args.is_spline)
                .expect("Failed to trace to JSON");
            fs::write(&args.output, json).expect("Failed to write output file");
            println!("Saved JSON to {:?}", args.output);
        },
        "svg" => {
            let svg = matte_core::trace_to_svg_core(&image_bytes, args.threshold, args.turd_size, args.smoothing, args.is_spline)
                .expect("Failed to trace to SVG");
            fs::write(&args.output, svg).expect("Failed to write output file");
            println!("Saved SVG to {:?}", args.output);
        },
        "dxf" => {
            let json = matte_core::trace_to_json_core(&image_bytes, args.threshold, args.turd_size, args.smoothing, args.is_spline)
                .expect("Failed to trace to JSON");
            let dxf = matte_core::export_to_fletcher_dxf_core(&json).expect("Failed to export to DXF");
            fs::write(&args.output, dxf).expect("Failed to write output file");
            println!("Saved DXF to {:?}", args.output);
        },
        _ => {
            eprintln!("Unsupported output extension: {}", ext);
            eprintln!("Please use .json, .svg, or .dxf");
        }
    }
}
