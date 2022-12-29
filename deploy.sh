#!/usr/bin/env bash
set -eu

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <server base path>"
  exit 2
fi
server=$1

build_backend() {
    cd api
    comopser install
    cd ..
}

generate_data() {
    tmp="$(mktemp -d)"
    cd generate

    # Coast
    echo "Generating coast data"
    wget "https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_coastline.zip" -O "$tmp/coast.zip"
    unzip "$tmp/coast.zip" -d "$tmp/coast"
    cargo run --bin vector -- -i "$tmp/coast/ne_10m_coastline.shp" -o "output/coast.shp"

    # Rivers
    echo "Generating rivers data"
    wget "https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/physical/ne_10m_rivers_lake_centerlines.zip" -O "$tmp/rivers.zip"
    unzip "$tmp/rivers.zip" -d "$tmp/rivers"
    cargo run --bin vector -- -i "$tmp/rivers/ne_10m_rivers_lake_centerlines.shp" -o "output/rivers.shp"

    # Railroads
    echo "Generating railroads data"
    wget "https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_railroads.zip" -O "$tmp/railroads.zip"
    unzip "$tmp/railroads.zip" -d "$tmp/railroads"
    cargo run --bin vector -- -i "$tmp/railroads/ne_10m_railroads.shp" -o "output/railroads.shp"

    # Earthview
    echo "Generating earthview data"
    wget "https://earthview.withgoogle.com/_api/photos.json" -O "$tmp/earthview.json"
    cargo run --bin earthview -- "$tmp/earthview.json"

    # Urban / Random
    echo "Generating urban / random data"
    wget "https://zenodo.org/record/3939050/files/PROBAV_LC100_global_v3.0.1_2019-nrt_Discrete-Classification-map_EPSG-4326.tif?download=1" -O "$tmp/landcover.tif"
    cargo run --release --bin landcover -- --landcover-path "$tmp/landcover.tif"

    Airports
    echo "Generating airports data"
    wget https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_airports.zip -O "$tmp/airports.zip"
    unzip "$tmp/airports.zip" -d "$tmp/airports"
    for ext in dbf prj shp shx; do
        cp "$tmp/airports/ne_10m_airports.$ext" "output/airports.$ext"
    done

    cd ..
    cp generate/output/*.* "api/data/"
}

build_frontend() {
    echo "Building frontend"
    cd frontend
    npx tsc
    npm run build
    cd ..
}

upload() {
    echo "Uploading code and data to server"
    rsync -a -vvi -zz --progress frontend/build/ "$server"
    rsync -a -vvi -zz --progress api/ "$server/api"
}

build_backend
generate_data
build_frontend
upload

