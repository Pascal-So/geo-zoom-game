use std::path::PathBuf;

use clap::Parser;
use geodist::{create_points_shapefile, from_line_strings_bucketed};

#[derive(Parser, Debug)]
struct Args {
    /// Path to the input shapefile
    #[arg(short, long)]
    input: PathBuf,

    /// Number of buckets in the x axis
    #[arg(short, long, default_value_t = 400.)]
    x_res: f64,

    /// Number of buckets in the y axis
    #[arg(short, long, default_value_t = 200.)]
    y_res: f64,

    /// Path to the output file
    #[arg(short, long)]
    output: PathBuf,
}

fn main() {
    let args = Args::parse();
    let data = gdal::Dataset::open(args.input).unwrap();
    let coords = from_line_strings_bucketed(data, (args.x_res, args.y_res));
    create_points_shapefile(args.output, coords);
}
