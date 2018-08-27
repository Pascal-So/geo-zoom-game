<?php
if (!isset($_GET['coords']) || !is_string($_GET['coords']))
   exit();

$date = (new DateTime())->format('[c]');
$coords = $_GET['coords'];
$log_line = $date . ' ' . $coords . "\n";

$file = 'generated_coordinates.log';

file_put_contents($file, $log_line, FILE_APPEND);
