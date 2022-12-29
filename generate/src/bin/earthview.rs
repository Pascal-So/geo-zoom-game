use std::{env, fs::File, io::BufReader};

use geodist::create_points_shapefile;
use serde_json::Value;

fn main() {
    let json_path = env::args().nth(1).expect("usage: ./earthview <path to photos.json>");

    let json: Value =
        serde_json::from_reader(BufReader::new(File::open(json_path).unwrap())).unwrap();

    let pts = json.as_array().unwrap().iter().map(|p| {
        let lat = p.get("lat").unwrap().as_f64().unwrap();
        let lng = p.get("lng").unwrap().as_f64().unwrap();
        (lng, lat)
    });

    create_points_shapefile("output/earthview.shp", pts);
}
