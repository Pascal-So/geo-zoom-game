#![feature(type_alias_impl_trait)]

pub mod reservoir;

use std::{
    collections::{hash_map::Entry, HashMap},
    path::Path,
};

use gdal::{
    spatial_ref::SpatialRef,
    vector::{Geometry, LayerAccess, OGRwkbGeometryType},
    LayerOptions,
};

/// Generate a Shapefile containing one layer in WGS84 with the provided points.
pub fn create_points_shapefile(
    out_path: impl AsRef<Path>,
    points: impl IntoIterator<Item = (f64, f64)>,
) {
    let mut out_dataset = gdal::DriverManager::get_driver_by_name("ESRI Shapefile")
        .unwrap()
        .create_vector_only(out_path)
        .unwrap();

    let geometry_type = gdal::vector::OGRwkbGeometryType::wkbPoint;

    let mut layer = out_dataset
        .create_layer(LayerOptions {
            srs: Some(&SpatialRef::from_epsg(4326).unwrap()),
            ty: geometry_type,
            ..Default::default()
        })
        .unwrap();

    for p in points {
        let mut geometry = gdal::vector::Geometry::empty(geometry_type).unwrap();
        geometry.add_point_2d(p);
        layer.create_feature(geometry).unwrap();
    }
}

/// Takes a dataset with one layer in WGS 84 containing line strings and
/// returns at most one coordinate per bucket from the line strings.
pub fn from_line_strings_bucketed(
    data: gdal::Dataset,
    res: (f64, f64),
) -> impl IntoIterator<Item = (f64, f64)> {
    let lc = data.layer_count();
    assert_eq!(
        lc, 1,
        "Expected the data to contain 1 layer but it contains {}.",
        lc
    );

    let mut layer = data.layer(0).unwrap();
    assert_eq!(
        layer.spatial_ref().unwrap().name().unwrap(),
        "WGS 84".to_string()
    );

    let mut coords = HashMap::new();
    for (i, f) in layer.features().enumerate() {
        assert!(
            f.geometry_by_index(1).is_err(),
            "Feature {i} has more than one geometry!"
        );

        let mut insert_points = |geo: &Geometry| {
            for (x, y, _) in geo.get_point_vec() {
                let bucket = lambert_bucket(res, (x, y));
                match coords.entry(bucket) {
                    Entry::Occupied(_) => {}
                    Entry::Vacant(entry) => {
                        entry.insert((x, y));
                    }
                };
                coords.insert(bucket, (x, y));
            }
        };

        match f.geometry().geometry_type() {
            OGRwkbGeometryType::wkbLineString => insert_points(f.geometry()),
            OGRwkbGeometryType::wkbMultiLineString => {
                for i in 0..f.geometry().geometry_count() {
                    insert_points(&f.geometry().get_geometry(i));
                }
            }
            _ => panic!(
                "Feature {i}: Expected linestring geometry, found {}.",
                f.geometry().geometry_type()
            ),
        };
    }
    coords.into_values()
}

/// To avoid excessive differences in point density, we bucket the generated points
/// by equal area buckets using a regular grid on the lambert projection (or
/// equivalently, any other cylindrical equal-aera projection).
fn lambert_bucket(res: (f64, f64), (x, y): (f64, f64)) -> (usize, usize) {
    let fac_x = res.0 / 360.;
    let fac_y = res.1 / 180.;
    let x = (x + 180.) * fac_x;
    let y = (y + 90.) * fac_y;
    (x as usize, y as usize)
}
