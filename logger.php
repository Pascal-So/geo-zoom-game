<?php
if (!isset($_GET['data']) || !is_string($_GET['data']))
   exit();

$date = (new DateTime())->format('[c]');
$data = $_GET['data'];
$log_line = $date . ' ' . $data . "\n";

$file = 'generated_coordinates.log';

file_put_contents($file, $log_line, FILE_APPEND);
