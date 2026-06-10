-- ── Organization profile fields on users ──────────────────────────────────
ALTER TABLE users
  ADD COLUMN org_name       VARCHAR(255)  NULL,
  ADD COLUMN org_address    VARCHAR(255)  NULL,
  ADD COLUMN org_lat        DOUBLE        NULL,
  ADD COLUMN org_lng        DOUBLE        NULL,
  ADD COLUMN org_logo_url   VARCHAR(500)  NULL;

-- Seed demo org data
UPDATE users SET
  org_name = 'Demo Bakery', org_address = '1 Market St, San Francisco, CA',
  org_lat = 37.7937, org_lng = -122.3947
WHERE email = 'donor@example.com';

UPDATE users SET
  org_name = 'Hope Shelter', org_address = '410 Hegenberger Rd, Oakland, CA',
  org_lat = 37.7321, org_lng = -122.2147
WHERE email = 'recipient@example.com';

-- ── Driver availability schedule ───────────────────────────────────────────
-- One row per (driver, day). No row for a day = driver unavailable that day.
-- If a driver has NO rows at all = always available (backward-compat).
CREATE TABLE driver_schedules (
  id           BIGINT     PRIMARY KEY AUTO_INCREMENT,
  driver_id    BIGINT     NOT NULL,
  day_of_week  VARCHAR(3) NOT NULL,   -- MON TUE WED THU FRI SAT SUN
  start_time   TIME       NOT NULL,
  end_time     TIME       NOT NULL,
  CONSTRAINT uq_driver_day UNIQUE (driver_id, day_of_week),
  CONSTRAINT fk_ds_driver  FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Password reset tokens ───────────────────────────────────────────────────
CREATE TABLE password_reset_tokens (
  id         BIGINT      PRIMARY KEY AUTO_INCREMENT,
  user_id    BIGINT      NOT NULL,
  token      VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP   NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Food photo on donations ─────────────────────────────────────────────────
ALTER TABLE donations
  ADD COLUMN photo_url VARCHAR(500) NULL;
