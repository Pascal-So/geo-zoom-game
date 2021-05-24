<?php
require __DIR__ . "/vendor/autoload.php";

define("DATA_DIR", __DIR__ . '/data');
define("LOG_DIR", __DIR__ . '/logs');

use Leaf\App;
use Leaf\Router;
use Shapefile\ShapefileReader;

Router::setBasePath("/");
$app = new App([
    "log.dir" => LOG_DIR,
]);

$app->set404(function() use($app) {
    $app->response()->json([
        'reason' => 'Route not found'
    ], 404);
});

$app->get('/available-maps', function() use($app) {
    $paths = glob(DATA_DIR . '/*.shp');

    $extract_name = function($path): string {
        return basename($path, '.shp');
    };

    $maps = array_map($extract_name, $paths);

    $app->response()->json($maps);
});

$app->get('/play-map/{map}', function($map) use($app) {
    $map_path = DATA_DIR . '/' . $map . '.shp';

    if (!file_exists($map_path)) {
        $app->response()->json([
            'reason' => "Map {$map} not found. See /api/available-maps."
        ], 404);
        return;
    }

    $shapefile = new ShapefileReader($map_path);
    $nr_records = $shapefile->getTotRecords();
    $point_index = rand(0, $nr_records - 1);

    $geometry = $shapefile->setCurrentRecord($point_index)->fetchRecord();
    $app->response()->json($geometry->getArray());
});

$app->get('/licenses', function() use($app) {
    $app->response()->json([
        'text' => file_get_contents(DATA_DIR . '/licenses.txt')
    ]);
});

$app->run();
