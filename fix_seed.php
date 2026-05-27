<?php
$file = 'backend/database/seed_data.sql';
$sql = file_get_contents($file);

// Clean up the undefined variable injection (it probably just inserted "360")
$sql = str_replace('360360', '360', $sql);
$sql = str_replace('320360', '360', $sql);
$sql = preg_replace('/(3,\s*2,\s*360,\s*6000\.00,\s*7800\.00,\s*NULL,\s*)360/', '$1 360', $sql);
$sql = preg_replace('/(2,\s*3,\s*360,\s*6000\.00,\s*7800\.00,\s*NULL,\s*)360/', '$1 360', $sql);

// Just completely replace the routes that got messed up if needed, but since it just appended 360
file_put_contents($file, $sql);
echo "Fixed seed_data.sql durations.\n";
