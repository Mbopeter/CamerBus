-- ============================================================
-- CamerBus — Seed: Companies (with company_class)
-- company_class:
--   'vip'      = only VIP/Luxury buses (premium fleet)
--   'standard' = only Standard/Coaster/Minibus buses
-- ============================================================
USE `camerbus`;

INSERT INTO `companies` (
  `id`, `name`, `slug`, `description`, `hq_city`, `phone`, `email`, `rating`, `total_reviews`, `is_active`, `is_verified`,
  `company_class`,
  `mtn_name`, `mtn_number`,
  `orange_name`, `orange_number`,
  `bank_name`, `bank_account`, `bank_account_name`
) VALUES
(1,  'Nso Boyz Express',     'nso-boyz-express',
  'Premier intercity transport connecting the North West to major Cameroon cities.',
  'Bamenda', '677123456', 'info@nsoboyz.cm', 4.5, 312, 1, 1,
  'standard',
  'NSO BOYZ EXPRESS', '677123456', NULL, NULL,
  'Afriland First Bank', '10010001001', 'NSO BOYZ EXPRESS SARL'),

(2,  'Vatican Express',       'vatican-express',
  'Reliable daily trips between Douala, Yaoundé and beyond.',
  'Douala', '699234567', 'info@vaticanexpress.cm', 4.2, 287, 1, 1,
  'standard',
  NULL, NULL, 'VATICAN EXPRESS', '699234567',
  NULL, NULL, NULL),

(3,  'Touristique Express',   'touristique-express',
  'Comfortable VIP and Standard coaches across Cameroon since 1998.',
  'Yaoundé', '677345678', 'contact@touristique.cm', 4.6, 541, 1, 1,
  'vip',   -- Operates VIP coaches
  'TOURISTIQUE EXPRESS', '677345678', 'TOURISTIQUE EXPRESS', '699345678',
  'Ecobank Cameroun', '20020002002', 'TOURISTIQUE EXPRESS SA'),

(4,  'Garanti Express',       'garanti-express',
  'Safe and affordable transport across the Littoral and North West regions.',
  'Douala', '699456789', NULL, 4.0, 198, 1, 1,
  'standard',
  NULL, NULL, 'GARANTI EXPRESS', '699456789',
  NULL, NULL, NULL),

(5,  'Général Express',       'general-express',
  'Nationwide network with modern buses and professional drivers.',
  'Yaoundé', '677567890', 'info@generalexpress.cm', 4.3, 421, 1, 1,
  'standard',
  'GENERAL EXPRESS', '677567890', NULL, NULL,
  'BICEC Cameroun', '30030003003', 'GENERAL EXPRESS SA'),

(6,  'Finexs Voyages',        'finexs-voyages',
  'Specializing in Bamenda corridor routes with luxury coaches.',
  'Bamenda', '677678901', NULL, 4.1, 165, 1, 1,
  'vip',   -- Luxury coaches only
  'FINEXS VOYAGES', '677678901', NULL, NULL,
  NULL, NULL, NULL),

(7,  'Moghamo Express',       'moghamo-express',
  'Community-driven transport service from the heart of the North West.',
  'Bamenda', '699789012', NULL, 3.9, 134, 1, 1,
  'standard',
  NULL, NULL, 'MOGHAMO EXPRESS', '699789012',
  NULL, NULL, NULL),

(8,  'Musango Bus Service',   'musango-bus-service',
  'Connecting Bafoussam and the West region to the rest of Cameroon.',
  'Bafoussam', '677890123', NULL, 4.0, 209, 1, 1,
  'standard',
  'MUSANGO BUS SERVICE', '677890123', NULL, NULL,
  NULL, NULL, NULL),

(9,  'United Express',        'united-express',
  'Modern fleet with multiple daily departures from Douala.',
  'Douala', '677901234', 'info@unitedexpress.cm', 4.4, 378, 1, 1,
  'standard',
  'UNITED EXPRESS', '677901234', 'UNITED EXPRESS', '699901234',
  'UBA Cameroun', '40040004004', 'UNITED EXPRESS SARL'),

(10, 'Oasis Travels',         'oasis-travels',
  'Premium travel experience across Cameroon southern and central routes.',
  'Yaoundé', '699012345', 'oasis@oasistravels.cm', 4.7, 490, 1, 1,
  'vip',   -- VIP/Premium only
  NULL, NULL, 'OASIS TRAVELS', '699012345',
  'Afriland First Bank', '50050005005', 'OASIS TRAVELS SA'),

(11, 'Afrique Lan Express',   'afrique-lan-express',
  'South West specialist connecting Kumba, Buea and Limbe to Douala.',
  'Kumba', '677012346', NULL, 3.8, 112, 1, 1,
  'standard',
  'AFRIQUE LAN EXPRESS', '677012346', NULL, NULL,
  NULL, NULL, NULL),

(12, 'Amour Mezam',           'amour-mezam',
  'Serving the Mezam division and connecting Bafoussam to Bamenda corridor.',
  'Bafoussam', '699123457', NULL, 4.2, 267, 1, 1,
  'standard',
  NULL, NULL, 'AMOUR MEZAM', '699123457',
  NULL, NULL, NULL),

(13, 'Buca Express',          'buca-express',
  'Fast express service on the Buea-Douala-Yaoundé triangle.',
  'Buea', '677223344', NULL, 4.1, 143, 1, 1,
  'standard',
  'BUCA EXPRESS', '677223344', NULL, NULL,
  NULL, NULL, NULL),

(14, 'Confort Voyages',       'confort-voyages',
  'Luxury coaches with AC, WiFi and onboard entertainment.',
  'Yaoundé', '699334455', 'confort@comfortvoyages.cm', 4.8, 623, 1, 1,
  'vip',   -- Luxury/VIP fleet only
  NULL, NULL, 'CONFORT VOYAGES', '699334455',
  'Societe Generale Cameroun', '60060006006', 'CONFORT VOYAGES SA'),

(15, 'Star Lines',            'star-lines',
  'Northern routes specialist — Garoua, Ngaoundéré, Maroua corridors.',
  'Garoua', '677445566', NULL, 3.9, 178, 1, 1,
  'standard',
  'STAR LINES', '677445566', NULL, NULL,
  NULL, NULL, NULL);
