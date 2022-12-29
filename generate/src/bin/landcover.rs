use std::path::PathBuf;

use clap::Parser;
use geodist::{create_points_shapefile, reservoir::Reservoir};

#[derive(Parser, Debug)]
struct Args {
    /// Number of coordinates to generate
    #[arg(short, long, default_value_t = 40000)]
    nr_coords: usize,

    /// Path to land cover geotif
    #[arg(short, long)]
    landcover_path: PathBuf,
}

fn main() {
    let args = Args::parse();

    let mut sampler_urban = Reservoir::new(args.nr_coords);
    let mut sampler_land = Reservoir::new(args.nr_coords);
    let landcover_dataset = gdal::Dataset::open(args.landcover_path).unwrap();
    let spatial_ref = landcover_dataset.spatial_ref().unwrap();
    assert_eq!(spatial_ref.name().unwrap(), "WGS 84".to_owned());

    let raster = landcover_dataset.rasterband(1).unwrap();
    let transform = landcover_dataset.geo_transform().unwrap();

    let (width, height) = raster.size();
    let mut buffer = vec![0; width];

    let mut rng = rand::thread_rng();
    for y in 0..height {
        if y % 100 == 0 {
            println!("progress: {y}/{height}");
        }

        raster
            .read_into_slice::<u8>((0, y as isize), (width, 1), (width, 1), &mut buffer, None)
            .unwrap();
        for (x, &entry) in buffer.iter().enumerate() {
            let (lng, lat) = raster_to_coord((x, y), &transform);

            if entry != 80 && entry != 200 {
                let weight = lat.to_radians().cos();
                sampler_land.push((lng, lat), weight, &mut rng);
                if entry == 50 {
                    sampler_urban.push((lng, lat), weight, &mut rng);
                }
            }
        }
    }
    create_points_shapefile("output/urban.shp", sampler_urban);
    create_points_shapefile("output/random.shp", sampler_land);
}

/// Get the projection space coordinates for the cell center given an integer raster coordinate.
fn raster_to_coord((x, y): (usize, usize), transform: &gdal::GeoTransform) -> (f64, f64) {
    let fx = x as f64 + 0.5;
    let fy = y as f64 + 0.5;

    (
        transform[0] + fx * transform[1] + fy * transform[2],
        transform[3] + fx * transform[4] + fy * transform[5],
    )
}
