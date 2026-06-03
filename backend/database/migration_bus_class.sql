-- ============================================================
-- CamerBus — Migration: Bus Class Isolation
-- Run this ONCE against your live database.
-- Enforces: VIP companies → VIP/Luxury buses only
--           Standard companies → Standard/Coaster/Minibus only
--           Each bus has ONE uniform seat type (no mixing)
-- ============================================================
USE `camerbus`;

-- ─────────────────────────────────────────────────────────────
-- STEP 1: Add company_class column (safe — skips if already exists)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE `companies`
  ADD COLUMN IF NOT EXISTS `company_class`
    ENUM('vip','standard') NOT NULL DEFAULT 'standard'
    COMMENT 'Classifies the company fleet: vip=VIP/Luxury only, standard=Standard/Coaster/Minibus only'
    AFTER `is_verified`,
  ADD INDEX IF NOT EXISTS `idx_companies_class` (`company_class`);

-- ─────────────────────────────────────────────────────────────
-- STEP 2: Classify known VIP-only companies
-- Add or update any company that operates exclusively VIP/Luxury
-- buses. All others stay 'standard' (the default).
-- ─────────────────────────────────────────────────────────────
UPDATE `companies` SET `company_class` = 'vip'
WHERE `slug` IN (
  'confort-voyages',      -- Luxury AC/WiFi coaches
  'oasis-travels',        -- Premium travel
  'touristique-express'   -- VIP + Standard: if they have both, keep 'standard'
                          -- Remove touristique-express from this list if they run mixed fleet
);

-- ─────────────────────────────────────────────────────────────
-- STEP 3: Fix existing buses that conflict with company_class
--   • VIP-class company → set all its buses to 'VIP'
--   • Standard-class company → set all its buses to 'Standard'
-- ─────────────────────────────────────────────────────────────

-- Upgrade non-VIP buses that belong to VIP companies
UPDATE `buses` b
JOIN `companies` c ON c.id = b.company_id
SET b.bus_type = 'VIP'
WHERE c.company_class = 'vip'
  AND b.bus_type NOT IN ('VIP','Luxury');

-- Downgrade VIP buses that belong to Standard companies
UPDATE `buses` b
JOIN `companies` c ON c.id = b.company_id
SET b.bus_type = 'Standard'
WHERE c.company_class = 'standard'
  AND b.bus_type IN ('VIP','Luxury');

-- ─────────────────────────────────────────────────────────────
-- STEP 4: Fix existing seats that have wrong seat_type for
--         their bus's bus_type (remove the mixed VIP/standard
--         seat rows that were generated incorrectly before)
-- ─────────────────────────────────────────────────────────────

-- All seats on a VIP/Luxury bus → seat_type = 'vip'
UPDATE `seats` se
JOIN  `buses`  b  ON b.id = se.bus_id
SET   se.seat_type = 'vip'
WHERE b.bus_type IN ('VIP','Luxury')
  AND se.seat_type != 'driver';

-- All seats on a Standard/Coaster/Minibus → seat_type = 'standard'
UPDATE `seats` se
JOIN  `buses`  b  ON b.id = se.bus_id
SET   se.seat_type = 'standard'
WHERE b.bus_type IN ('Standard','Coaster','Minibus')
  AND se.seat_type != 'driver';

-- ─────────────────────────────────────────────────────────────
-- STEP 5: Add trigger to enforce bus class at INSERT time
--         (blocks adding a wrong bus_type to a company)
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS `trg_buses_class_check_insert`;
DELIMITER $$
CREATE TRIGGER `trg_buses_class_check_insert`
BEFORE INSERT ON `buses`
FOR EACH ROW
BEGIN
  DECLARE v_class VARCHAR(20);
  SELECT company_class INTO v_class FROM companies WHERE id = NEW.company_id;

  IF v_class = 'vip' AND NEW.bus_type NOT IN ('VIP','Luxury') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'This company only allows VIP or Luxury buses (company_class = vip).';
  END IF;

  IF v_class = 'standard' AND NEW.bus_type IN ('VIP','Luxury') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'This company only allows Standard/Coaster/Minibus buses (company_class = standard).';
  END IF;
END$$
DELIMITER ;

-- ─────────────────────────────────────────────────────────────
-- STEP 6: Add trigger to enforce bus class at UPDATE time
-- ─────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS `trg_buses_class_check_update`;
DELIMITER $$
CREATE TRIGGER `trg_buses_class_check_update`
BEFORE UPDATE ON `buses`
FOR EACH ROW
BEGIN
  DECLARE v_class VARCHAR(20);
  SELECT company_class INTO v_class FROM companies WHERE id = NEW.company_id;

  IF v_class = 'vip' AND NEW.bus_type NOT IN ('VIP','Luxury') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'This company only allows VIP or Luxury buses (company_class = vip).';
  END IF;

  IF v_class = 'standard' AND NEW.bus_type IN ('VIP','Luxury') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'This company only allows Standard/Coaster/Minibus buses (company_class = standard).';
  END IF;
END$$
DELIMITER ;

-- ─────────────────────────────────────────────────────────────
-- DONE — Verify with:
-- SELECT c.name, c.company_class, b.plate_number, b.bus_type
-- FROM companies c JOIN buses b ON b.company_id = c.id ORDER BY c.name;
-- ─────────────────────────────────────────────────────────────
