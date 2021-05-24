fn main() {
    let mut last_y = 1000000;
    let mut lat_weight = 0.;

    let weight = move|category: u8, point: &(usize, usize), transform: &gdal::GeoTransform| {
        if category == 50 {
            if point.1 != last_y {
                let (_, lat) = geodist::index_to_coord(point, transform);
                lat_weight = lat.to_radians().cos();
                last_y = point.1;
            }
            lat_weight
        } else {
            0.0
        }
    };

    geodist::rasterfile_to_shapefile(weight, "cover_global_discrete.tif", "out.shp", 20000);
}
