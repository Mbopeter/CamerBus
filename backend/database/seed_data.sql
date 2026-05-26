-- ============================================================
-- CamerBus — Seed: Branches, Buses, Routes, Schedules
-- ============================================================
USE `camerbus`;

-- ============================================================
-- BRANCHES (city_id refs: 1=Yaoundé, 2=Douala, 3=Bamenda,
--  4=Bafoussam, 5=Buea, 6=Limbe, 7=Ngaoundéré, 10=Kumba)
-- ============================================================
INSERT INTO `branches` (`id`,`company_id`,`city_id`,`name`,`address`,`phone`,`is_active`) VALUES
-- NSO BOYZ EXPRESS (company 1) — Bamenda, Douala, Yaoundé
(1,  1, 3, 'Mile 4 - Bamenda',       'Mile 4 Nkwen, Bamenda',           '677111001', 1),
(2,  1, 3, 'Bambui - Bamenda',        'Bambui Junction, Bamenda',        '677111002', 1),
(3,  1, 3, 'City Chemist - Bamenda',  'City Chemist, Bamenda',           '677111003', 1),
(4,  1, 2, 'Bonaberi - Douala',       'Bonaberi Terminal, Douala',       '677111004', 1),
(5,  1, 2, 'Akwa - Douala',           'Akwa, Bonanjo Road, Douala',      '677111005', 1),
(6,  1, 1, 'Biyem-Assi - Yaoundé',   'Biyem-Assi Carrefour, Yaoundé',  '677111006', 1),
(7,  1, 1, 'Mvan - Yaoundé',          'Mvan Terminal, Yaoundé',          '677111007', 1),

-- VATICAN EXPRESS (company 2) — Douala, Yaoundé, Bamenda
(8,  2, 2, 'Bonaberi - Douala',       'Bonaberi, Douala',                '699222001', 1),
(9,  2, 2, 'Deido - Douala',          'Deido Quarter, Douala',           '699222002', 1),
(10, 2, 1, 'Biyem-Assi - Yaoundé',   'Biyem-Assi, Yaoundé',            '699222003', 1),
(11, 2, 1, 'Mvan - Yaoundé',          'Mvan, Yaoundé',                   '699222004', 1),
(12, 2, 3, 'City Chemist - Bamenda',  'City Chemist, Bamenda',           '699222005', 1),

-- TOURISTIQUE EXPRESS (company 3) — Yaoundé, Douala, Bamenda, Buea
(13, 3, 1, 'Biscuiterie - Yaoundé',  'Biscuiterie, Yaoundé',            '677333001', 1),
(14, 3, 1, 'Mvan - Yaoundé',          'Mvan Terminal, Yaoundé',          '677333002', 1),
(15, 3, 2, 'Akwa - Douala',           'Akwa, Douala',                    '677333003', 1),
(16, 3, 2, 'Bonaberi - Douala',       'Bonaberi, Douala',                '677333004', 1),
(17, 3, 3, 'Mile 4 - Bamenda',        'Mile 4 Nkwen, Bamenda',           '677333005', 1),
(18, 3, 5, 'Buea Town',               'Buea Town Park, Buea',            '677333006', 1),

-- GARANTI EXPRESS (company 4) — Douala, Bamenda, Yaoundé
(19, 4, 2, 'Bonaberi - Douala',       'Bonaberi Terminal, Douala',       '699444001', 1),
(20, 4, 2, 'Bépanda - Douala',        'Bépanda, Douala',                 '699444002', 1),
(21, 4, 3, 'Bambui - Bamenda',        'Bambui Junction, Bamenda',        '699444003', 1),
(22, 4, 1, 'Biyem-Assi - Yaoundé',   'Biyem-Assi, Yaoundé',            '699444004', 1),

-- GÉNÉRAL EXPRESS (company 5) — Yaoundé, Douala, Buea, Bafoussam
(23, 5, 1, 'Biscuiterie - Yaoundé',  'Biscuiterie, Yaoundé',            '677555001', 1),
(24, 5, 1, 'Mvan - Yaoundé',          'Mvan, Yaoundé',                   '677555002', 1),
(25, 5, 2, 'Akwa - Douala',           'Akwa, Douala',                    '677555003', 1),
(26, 5, 5, 'Buea Town',               'Buea Town, Buea',                 '677555004', 1),
(27, 5, 4, 'Bafoussam Marché',        'Grand Marché, Bafoussam',         '677555005', 1),

-- FINEXS VOYAGES (company 6) — Bamenda, Douala, Yaoundé
(28, 6, 3, 'Mile 4 - Bamenda',        'Mile 4 Nkwen, Bamenda',           '677666001', 1),
(29, 6, 2, 'Bonaberi - Douala',       'Bonaberi, Douala',                '677666002', 1),
(30, 6, 1, 'Biyem-Assi - Yaoundé',   'Biyem-Assi, Yaoundé',            '677666003', 1),

-- MOGHAMO EXPRESS (company 7) — Bamenda, Yaoundé
(31, 7, 3, 'City Chemist - Bamenda',  'City Chemist, Bamenda',           '699777001', 1),
(32, 7, 1, 'Mvan - Yaoundé',          'Mvan, Yaoundé',                   '699777002', 1),

-- MUSANGO BUS SERVICE (company 8) — Bafoussam, Douala, Yaoundé
(33, 8, 4, 'Bafoussam Centre',        'Centre-ville, Bafoussam',         '677888001', 1),
(34, 8, 2, 'Deido - Douala',          'Deido, Douala',                   '677888002', 1),
(35, 8, 1, 'Biyem-Assi - Yaoundé',   'Biyem-Assi, Yaoundé',            '677888003', 1),

-- UNITED EXPRESS (company 9) — Douala, Yaoundé, Buea, Limbe
(36, 9, 2, 'Bonaberi - Douala',       'Bonaberi Terminal, Douala',       '677999001', 1),
(37, 9, 2, 'Akwa - Douala',           'Akwa, Douala',                    '677999002', 1),
(38, 9, 1, 'Mvan - Yaoundé',          'Mvan, Yaoundé',                   '677999003', 1),
(39, 9, 5, 'Buea Town',               'Buea Town, Buea',                 '677999004', 1),
(40, 9, 6, 'Limbe Motor Park',        'Motor Park, Limbe',               '677999005', 1),

-- OASIS TRAVELS (company 10) — Yaoundé, Douala, Ngaoundéré
(41, 10, 1, 'Biscuiterie - Yaoundé', 'Biscuiterie, Yaoundé',            '699010001', 1),
(42, 10, 2, 'Akwa - Douala',          'Akwa, Douala',                    '699010002', 1),
(43, 10, 7, 'Ngaoundéré Gare',        'Gare Routière, Ngaoundéré',      '699010003', 1),

-- AFRIQUE LAN EXPRESS (company 11) — Kumba, Douala, Buea
(44, 11, 10, 'Kumba Motor Park',      'Motor Park, Kumba',               '677011001', 1),
(45, 11, 2,  'Bonaberi - Douala',     'Bonaberi, Douala',                '677011002', 1),
(46, 11, 5,  'Buea Town',             'Buea Town, Buea',                 '677011003', 1),

-- AMOUR MEZAM (company 12) — Bafoussam, Bamenda, Yaoundé
(47, 12, 4, 'Bafoussam Centre',       'Centre-ville, Bafoussam',         '699012001', 1),
(48, 12, 3, 'Mile 4 - Bamenda',       'Mile 4 Nkwen, Bamenda',           '699012002', 1),
(49, 12, 1, 'Biyem-Assi - Yaoundé',  'Biyem-Assi, Yaoundé',            '699012003', 1);

-- ============================================================
-- BUSES
-- ============================================================
INSERT INTO `buses` (`id`,`company_id`,`branch_id`,`plate_number`,`name`,`bus_type`,`total_seats`,`is_active`) VALUES
-- NSO BOYZ (company 1)
(1,  1, 1, 'NW-0101-BN', 'Nso Star 1',     'Standard', 70, 1),
(2,  1, 1, 'NW-0102-BN', 'Nso Star 2',     'VIP',      50, 1),
(3,  1, 2, 'NW-0103-BN', 'Nso Coaster 1',  'Coaster',  30, 1),
-- VATICAN EXPRESS (company 2)
(4,  2, 8, 'LT-0201-DL', 'Vatican 1',      'Standard', 70, 1),
(5,  2, 8, 'LT-0202-DL', 'Vatican VIP',    'VIP',      50, 1),
-- TOURISTIQUE (company 3)
(6,  3, 13,'CE-0301-YD', 'Touristique 1',  'Luxury',   45, 1),
(7,  3, 13,'CE-0302-YD', 'Touristique 2',  'Standard', 70, 1),
(8,  3, 15,'LT-0303-DL', 'Touristique 3',  'VIP',      50, 1),
-- GARANTI (company 4)
(9,  4, 19,'LT-0401-DL', 'Garanti 1',      'Standard', 70, 1),
(10, 4, 19,'LT-0402-DL', 'Garanti 2',      'Standard', 70, 1),
-- GÉNÉRAL (company 5)
(11, 5, 23,'CE-0501-YD', 'General VIP 1',  'VIP',      50, 1),
(12, 5, 23,'CE-0502-YD', 'General STD 1',  'Standard', 70, 1),
-- FINEXS (company 6)
(13, 6, 28,'NW-0601-BN', 'Finexs 1',       'Standard', 70, 1),
(14, 6, 28,'NW-0602-BN', 'Finexs VIP',     'VIP',      50, 1),
-- MOGHAMO (company 7)
(15, 7, 31,'NW-0701-BN', 'Moghamo 1',      'Standard', 70, 1),
-- MUSANGO (company 8)
(16, 8, 33,'OU-0801-BF', 'Musango 1',      'Standard', 70, 1),
(17, 8, 33,'OU-0802-BF', 'Musango VIP',    'VIP',      50, 1),
-- UNITED (company 9)
(18, 9, 36,'LT-0901-DL', 'United 1',       'Standard', 70, 1),
(19, 9, 36,'LT-0902-DL', 'United VIP',     'VIP',      50, 1),
(20, 9, 37,'LT-0903-DL', 'United 3',       'Luxury',   45, 1),
-- OASIS (company 10)
(21, 10,41,'CE-1001-YD', 'Oasis Luxury 1', 'Luxury',   45, 1),
(22, 10,41,'CE-1002-YD', 'Oasis VIP 1',    'VIP',      50, 1),
-- AFRIQUE LAN (company 11)
(23, 11,44,'SW-1101-KM', 'Afrique Lan 1',  'Standard', 70, 1),
-- AMOUR MEZAM (company 12)
(24, 12,47,'OU-1201-BF', 'Amour Mezam 1',  'Standard', 70, 1),
(25, 12,47,'OU-1202-BF', 'Amour Mezam VIP','VIP',      50, 1);

-- ============================================================
-- ROUTES (origin_city_id, dest_city_id with prices in XAF)
-- ============================================================
INSERT INTO `routes` (`id`,`company_id`,`origin_city_id`,`dest_city_id`,`distance_km`,`price_standard`,`price_vip`,`price_luxury`,`estimated_duration_minutes`,`is_active`) VALUES
-- NSO BOYZ: Bamenda(3) ↔ Douala(2), Yaoundé(1)
(1,  1, 3, 2, 360, 6000.00, 7800.00, NULL,  300, 1),
(2,  1, 2, 3, 360, 6000.00, 7800.00, NULL,  300, 1),
(3,  1, 3, 1, 400, 6500.00, 8500.00, NULL,  360, 1),
(4,  1, 1, 3, 400, 6500.00, 8500.00, NULL,  360, 1),

-- VATICAN EXPRESS: Douala(2) ↔ Yaoundé(1), Bamenda(3)
(5,  2, 2, 1, 240, 4000.00, 5200.00, NULL,  240, 1),
(6,  2, 1, 2, 240, 4000.00, 5200.00, NULL,  240, 1),
(7,  2, 2, 3, 360, 6000.00, 7800.00, NULL,  300, 1),
(8,  2, 3, 2, 360, 6000.00, 7800.00, NULL,  300, 1),

-- TOURISTIQUE: Yaoundé(1) ↔ Douala(2), Bamenda(3), Buea(5)
(9,  3, 1, 2, 240, 4000.00, 5200.00, 6500.00, 240, 1),
(10, 3, 2, 1, 240, 4000.00, 5200.00, 6500.00, 240, 1),
(11, 3, 1, 3, 400, 6500.00, 8500.00, NULL,    360, 1),
(12, 3, 3, 1, 400, 6500.00, 8500.00, NULL,    360, 1),
(13, 3, 2, 5,  80, 2000.00, 2600.00, NULL,     75, 1),
(14, 3, 5, 2,  80, 2000.00, 2600.00, NULL,     75, 1),

-- GARANTI: Douala(2) ↔ Bamenda(3), Yaoundé(1)
(15, 4, 2, 3, 360, 6000.00, 7800.00, NULL,  300, 1),
(16, 4, 3, 2, 360, 6000.00, 7800.00, NULL,  300, 1),
(17, 4, 2, 1, 240, 4000.00, 5200.00, NULL,  240, 1),
(18, 4, 1, 2, 240, 4000.00, 5200.00, NULL,  240, 1),

-- GÉNÉRAL: Yaoundé(1) ↔ Douala(2), Buea(5), Bafoussam(4)
(19, 5, 1, 2, 240, 4000.00, 5200.00, NULL,  240, 1),
(20, 5, 2, 1, 240, 4000.00, 5200.00, NULL,  240, 1),
(21, 5, 1, 5, 340, 6000.00, 7800.00, NULL,  320, 1),
(22, 5, 5, 1, 340, 6000.00, 7800.00, NULL,  320, 1),
(23, 5, 1, 4, 270, 4500.00, 5850.00, NULL,  270, 1),
(24, 5, 4, 1, 270, 4500.00, 5850.00, NULL,  270, 1),

-- FINEXS: Bamenda(3) ↔ Douala(2), Yaoundé(1)
(25, 6, 3, 2, 360, 6000.00, 7800.00, NULL,  300, 1),
(26, 6, 2, 3, 360, 6000.00, 7800.00, NULL,  300, 1),
(27, 6, 3, 1, 400, 6500.00, 8500.00, NULL,  360, 1),
(28, 6, 1, 3, 400, 6500.00, 8500.00, NULL,  360, 1),

-- MOGHAMO: Bamenda(3) ↔ Yaoundé(1)
(29, 7, 3, 1, 400, 6500.00, 8500.00, NULL,  360, 1),
(30, 7, 1, 3, 400, 6500.00, 8500.00, NULL,  360, 1),

-- MUSANGO: Bafoussam(4) ↔ Douala(2), Yaoundé(1)
(31, 8, 4, 2, 300, 5000.00, 6500.00, NULL,  270, 1),
(32, 8, 2, 4, 300, 5000.00, 6500.00, NULL,  270, 1),
(33, 8, 4, 1, 270, 4500.00, 5850.00, NULL,  255, 1),
(34, 8, 1, 4, 270, 4500.00, 5850.00, NULL,  255, 1),

-- UNITED: Douala(2) ↔ Yaoundé(1), Buea(5), Limbe(6)
(35, 9, 2, 1, 240, 4000.00, 5200.00, 6500.00, 240, 1),
(36, 9, 1, 2, 240, 4000.00, 5200.00, 6500.00, 240, 1),
(37, 9, 2, 5,  80, 2000.00, 2600.00, NULL,     75, 1),
(38, 9, 5, 2,  80, 2000.00, 2600.00, NULL,     75, 1),
(39, 9, 2, 6,  70, 2000.00, 2600.00, NULL,     70, 1),
(40, 9, 6, 2,  70, 2000.00, 2600.00, NULL,     70, 1),

-- OASIS: Yaoundé(1) ↔ Douala(2), Ngaoundéré(7)
(41, 10, 1, 2, 240, 4000.00, 5200.00, 6500.00, 240, 1),
(42, 10, 2, 1, 240, 4000.00, 5200.00, 6500.00, 240, 1),
(43, 10, 1, 7, 550, 9000.00,11700.00,14000.00, 540, 1),
(44, 10, 7, 1, 550, 9000.00,11700.00,14000.00, 540, 1),

-- AFRIQUE LAN: Kumba(10) ↔ Douala(2), Buea(5)
(45, 11, 10, 2, 120, 2500.00, 3250.00, NULL, 120, 1),
(46, 11, 2, 10, 120, 2500.00, 3250.00, NULL, 120, 1),
(47, 11, 10, 5,  60, 1500.00, 1950.00, NULL,  60, 1),
(48, 11, 5, 10,  60, 1500.00, 1950.00, NULL,  60, 1),

-- AMOUR MEZAM: Bafoussam(4) ↔ Bamenda(3), Yaoundé(1)
(49, 12, 4, 3, 120, 3000.00, 3900.00, NULL, 150, 1),
(50, 12, 3, 4, 120, 3000.00, 3900.00, NULL, 150, 1),
(51, 12, 4, 1, 270, 4500.00, 5850.00, NULL, 255, 1),
(52, 12, 1, 4, 270, 4500.00, 5850.00, NULL, 255, 1);

-- ============================================================
-- SCHEDULES — Representative schedules for next 3 days
-- Uses CURDATE() so always current
-- ============================================================
INSERT INTO `schedules` (`route_id`,`bus_id`,`origin_branch_id`,`dest_branch_id`,`travel_date`,`departure_time`,`estimated_arrival_time`,`shift`,`status`,`available_seats`,`booked_seats`) VALUES

-- Route 1: Nso Boyz Bamenda→Douala (3→2) — buses 1,2
(1, 1, 1, 4, CURDATE(),       '06:00:00', '11:00:00', 'morning',   'scheduled', 70, 0),
(1, 2, 1, 5, CURDATE(),       '07:30:00', '12:30:00', 'morning',   'scheduled', 50, 0),
(1, 1, 1, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '06:00:00', '11:00:00', 'morning', 'scheduled', 70, 0),
(1, 2, 1, 5, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:30:00', '12:30:00', 'morning', 'scheduled', 50, 0),
(1, 1, 2, 4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '06:00:00', '11:00:00', 'morning', 'scheduled', 70, 0),

-- Route 3: Nso Boyz Bamenda→Yaoundé (3→1)
(3, 1, 1, 6, CURDATE(),       '05:00:00', '11:00:00', 'morning',   'scheduled', 70, 0),
(3, 2, 3, 7, CURDATE(),       '14:00:00', '20:00:00', 'afternoon', 'scheduled', 50, 0),
(3, 1, 1, 6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '05:00:00', '11:00:00', 'morning', 'scheduled', 70, 0),

-- Route 5: Vatican Douala→Yaoundé (2→1)
(5, 4, 8, 10, CURDATE(),      '06:00:00', '10:00:00', 'morning',   'scheduled', 70, 0),
(5, 5, 8, 11, CURDATE(),      '13:00:00', '17:00:00', 'afternoon', 'scheduled', 50, 0),
(5, 4, 8, 10, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '06:00:00', '10:00:00', 'morning', 'scheduled', 70, 0),
(5, 5, 9, 10, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00:00', '00:00:00', 'night',   'scheduled', 50, 0),

-- Route 9: Touristique Yaoundé→Douala (1→2) Luxury
(9, 6, 13, 15, CURDATE(),     '07:00:00', '11:00:00', 'morning',   'scheduled', 45, 0),
(9, 7, 14, 15, CURDATE(),     '09:00:00', '13:00:00', 'morning',   'scheduled', 70, 0),
(9, 8, 13, 16, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:00:00', '11:00:00', 'morning', 'scheduled', 50, 0),

-- Route 19: Général Yaoundé→Douala
(19, 11, 23, 25, CURDATE(),   '06:30:00', '10:30:00', 'morning',   'scheduled', 50, 0),
(19, 12, 24, 25, CURDATE(),   '14:00:00', '18:00:00', 'afternoon', 'scheduled', 70, 0),
(19, 11, 23, 25, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '06:30:00', '10:30:00', 'morning', 'scheduled', 50, 0),

-- Route 35: United Douala→Yaoundé (Luxury)
(35, 18, 36, 38, CURDATE(),   '07:00:00', '11:00:00', 'morning',   'scheduled', 70, 0),
(35, 19, 37, 38, CURDATE(),   '13:00:00', '17:00:00', 'afternoon', 'scheduled', 50, 0),
(35, 20, 36, 38, CURDATE(),   '20:00:00', '00:00:00', 'night',     'scheduled', 45, 0),
(35, 18, 36, 38, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:00:00', '11:00:00', 'morning', 'scheduled', 70, 0),

-- Route 41: Oasis Yaoundé→Douala Luxury
(41, 21, 41, 42, CURDATE(),   '08:00:00', '12:00:00', 'morning',   'scheduled', 45, 0),
(41, 22, 41, 42, CURDATE(),   '14:00:00', '18:00:00', 'afternoon', 'scheduled', 50, 0),

-- Route 37: United Douala→Buea
(37, 18, 36, 39, CURDATE(),   '07:30:00', '09:00:00', 'morning',   'scheduled', 70, 0),
(37, 19, 37, 39, CURDATE(),   '11:00:00', '12:30:00', 'morning',   'scheduled', 50, 0),
(37, 18, 36, 39, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:30:00', '09:00:00', 'morning', 'scheduled', 70, 0),

-- Route 49: Amour Mezam Bafoussam→Bamenda
(49, 24, 47, 48, CURDATE(),   '06:00:00', '08:30:00', 'morning',   'scheduled', 70, 0),
(49, 25, 47, 48, CURDATE(),   '12:00:00', '14:30:00', 'afternoon', 'scheduled', 50, 0),
(49, 24, 47, 48, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '06:00:00', '08:30:00', 'morning', 'scheduled', 70, 0);

-- ============================================================
-- DEFAULT SUPER ADMIN
-- Password: Admin@123 (bcrypt hashed)
-- ============================================================
INSERT INTO `admins` (`full_name`, `email`, `password_hash`, `role`, `company_id`, `branch_id`, `is_active`) VALUES
('Super Administrator', 'admin@camerbus.cm',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- Admin@123
 'super_admin', NULL, NULL, 1),
('Nso Boyz Admin', 'admin@nsoboyz.cm',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
 'company_admin', 1, NULL, 1),
('Vatican Admin', 'admin@vaticanexpress.cm',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
 'company_admin', 2, NULL, 1),
('Mile 4 Branch Admin', 'branch1@nsoboyz.cm',
 '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
 'branch_admin', 1, 1, 1);
