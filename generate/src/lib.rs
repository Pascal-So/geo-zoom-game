use std::path::Path;
use rand::distributions::{
    Distribution,
    WeightedIndex,
};

pub fn rasterfile_to_shapefile<T, F, P>(mut weight_function: F, in_path: P, out_path: &str, nr_samples: usize)
where
    T: Copy + gdal::raster::GdalType,
    F: FnMut(T, &(usize, usize), &gdal::GeoTransform) -> f64,
    P: AsRef<Path>,
{
    let in_dataset = gdal::Dataset::open(in_path.as_ref()).unwrap();
    let raster = in_dataset.rasterband(1).unwrap();
    let transform = in_dataset.geo_transform().unwrap();

    let fun = |c: T, pos: &(usize, usize)| -> f64 {
        weight_function(c, pos, &transform)
    };
    let samples = sample_on_raster(&raster, fun, nr_samples);

    let mut out_dataset = gdal::Driver::get("ESRI Shapefile").unwrap().create_vector_only(out_path).unwrap();

    let spatial_ref = in_dataset.spatial_ref().unwrap();
    let geometry_type = gdal::vector::OGRwkbGeometryType::wkbPoint;

    let mut layer = out_dataset.create_layer("", Some(&spatial_ref), geometry_type).unwrap();

    for sample in &samples {
        let mut geometry = gdal::vector::Geometry::empty(geometry_type).unwrap();
        geometry.add_point_2d(index_to_coord(sample, &transform));
        layer.create_feature(geometry).unwrap();
    }
}

pub fn index_to_coord((x, y): &(usize, usize), transform: &gdal::GeoTransform) -> (f64, f64) {
    let fx = *x as f64 + 0.5;
    let fy = *y as f64 + 0.5;

    (
        transform[0] + fx * transform[1] + fy * transform[2],
        transform[3] + fx * transform[4] + fy * transform[5]
    )
}

pub fn sample_on_raster<T, F>(raster_band: &gdal::raster::RasterBand, mut weight_function: F, nr_samples: usize) -> Vec<(usize, usize)>
where
    T: Copy + gdal::raster::GdalType,
    F: FnMut(T, &(usize, usize)) -> f64,
{
    assert_eq!(raster_band.band_type(), T::gdal_type());

    let (width, height) = raster_band.size();

    let mut buffer: Vec<T> = Vec::with_capacity(width);

    // Safety: read_into_slice writes to all entries before we read from buffer.
    unsafe {
        buffer.set_len(width);
    };

    let mut weight_per_row: Vec<f64> = Vec::with_capacity(height);

    for y in 0..height {
        if y % 100 == 0 {
            println!("{}", y);
        }

        weight_per_row.push(0.0);

        raster_band.read_into_slice((0, y as isize), (width, 1), (width, 1), &mut buffer, None).unwrap();
        for (x, &entry) in buffer.iter().enumerate() {
            let weight = weight_function(entry, &(x, y));
            weight_per_row[y] += weight;
        }
    }

    let dist = WeightedIndex::new(&weight_per_row).unwrap();

    let mut weights: Vec<f64> = vec![0.; width];
    let mut out: Vec<(usize, usize)> = Vec::with_capacity(nr_samples);

    let mut rng = rand::thread_rng();
    for sample in 0..nr_samples {
        if sample % 100 == 0 {
            println!("sample: {}", sample);
        }

        let y = dist.sample(&mut rng);

        raster_band.read_into_slice((0, y as isize), (width, 1), (width, 1), &mut buffer, None).unwrap();

        for (x, &entry) in buffer.iter().enumerate() {
            weights[x] = weight_function(entry, &(x, y));
        }

        let x = WeightedIndex::new(&weights).unwrap().sample(&mut rng);
        out.push((x, y));
    }

    out
}
