# Geo Zoom Game

Zoom out until you recognize the location. I didn't add a scoring system to the
game because I don't want this to be competitive, it should just be a fun thing
to spend a couple of minutes and to discover various places.

```bash
cd frontend
yarn install
yarn tsc
yarn build
cd ..

cd api
composer install
cd ..

cd generate
cargo run --release
cd ..

cp generate/*.{shp,shx,dbf,prj} api/data/
```

Now copy the contents of `frontend/build/` along with the entire `api/` dir to
the server's public dir.
