-- Add mandatory phone number + verification flags
ALTER TABLE users
  ADD COLUMN phone_number VARCHAR(20) NOT NULL DEFAULT '+15550000000',
  ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT 0,
  ADD COLUMN phone_verified_at TIMESTAMP NULL;

-- Seed demo phone numbers as verified
UPDATE users SET phone_number = '+15550000001', phone_verified = 1, phone_verified_at = NOW() WHERE email = 'donor@example.com';
UPDATE users SET phone_number = '+15550000002', phone_verified = 1, phone_verified_at = NOW() WHERE email = 'recipient@example.com';
UPDATE users SET phone_number = '+15550000003', phone_verified = 1, phone_verified_at = NOW() WHERE email = 'driver@example.com';
UPDATE users SET phone_number = '+15550000004', phone_verified = 1, phone_verified_at = NOW() WHERE email = 'admin@example.com';

-- Store active verification codes (hashed). One active code per user.
CREATE TABLE phone_verification_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  attempt_count INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_phone_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
