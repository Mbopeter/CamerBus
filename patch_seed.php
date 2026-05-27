<?php
$file = 'backend/database/seed_data.sql';
$sql = file_get_contents($file);

// Replace durations for 6 hours
$sql = preg_replace("/(3,\s*2,\s*360,\s*6000\.00,\s*7800\.00,\s*NULL,\s*)300/", "${1}360", $sql);
$sql = preg_replace("/(2,\s*3,\s*360,\s*6000\.00,\s*7800\.00,\s*NULL,\s*)300/", "${1}360", $sql);

// Set Yaounde <-> Buea to 360 mins
$sql = preg_replace("/(1,\s*5,\s*340,\s*6000\.00,\s*7800\.00,\s*NULL,\s*)320/", "${1}360", $sql);
$sql = preg_replace("/(5,\s*1,\s*340,\s*6000\.00,\s*7800\.00,\s*NULL,\s*)320/", "${1}360", $sql);

// Add Touristique Limbe Branch
if (strpos($sql, "Limbe Motor Park - Touristique") === false) {
    $sql = str_replace(
        "-- GARANTI EXPRESS (company 4)",
        "(100, 3, 6, 'Limbe Motor Park - Touristique', 'Motor Park, Limbe', '677333007', 1),\n-- GARANTI EXPRESS (company 4)",
        $sql
    );
}

// Add new routes
$newRoutes = "
-- TOURISTIQUE: Bamenda(3) <-> Buea(5), Bamenda(3) <-> Limbe(6)
(101, 3, 3, 5, 380, 6500.00, 8500.00, NULL, 360, 1),
(102, 3, 5, 3, 380, 6500.00, 8500.00, NULL, 360, 1),
(103, 3, 3, 6, 400, 6500.00, 8500.00, NULL, 360, 1),
(104, 3, 6, 3, 400, 6500.00, 8500.00, NULL, 360, 1),

-- UNITED: Yaounde(1) <-> Limbe(6)
(105, 9, 1, 6, 310, 6000.00, 7800.00, NULL, 360, 1),
(106, 9, 6, 1, 310, 6000.00, 7800.00, NULL, 360, 1),
";

if (strpos($sql, "101, 3, 3, 5") === false) {
    $sql = str_replace(
        "-- ============================================================\n-- SCHEDULES",
        $newRoutes . "\n-- ============================================================\n-- SCHEDULES",
        $sql
    );
}

// Add schedules for these new routes
$newSchedules = "
-- Route 101: Touristique Bamenda->Buea
(101, 7, 17, 18, CURDATE(), '08:00:00', '14:00:00', 'morning', 'scheduled', 70, 0),
(101, 7, 17, 18, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '14:00:00', 'morning', 'scheduled', 70, 0),

-- Route 103: Touristique Bamenda->Limbe
(103, 7, 17, 100, CURDATE(), '09:00:00', '15:00:00', 'morning', 'scheduled', 70, 0),

-- Route 105: United Yaounde->Limbe
(105, 18, 38, 40, CURDATE(), '07:00:00', '13:00:00', 'morning', 'scheduled', 70, 0),
";

if (strpos($sql, "-- Route 101: Touristique Bamenda->Buea") === false) {
    $sql = str_replace(
        "-- ============================================================\n-- DEFAULT SUPER ADMIN",
        $newSchedules . "\n-- ============================================================\n-- DEFAULT SUPER ADMIN",
        $sql
    );
}

file_put_contents($file, $sql);
echo "Patched seed_data.sql\n";
