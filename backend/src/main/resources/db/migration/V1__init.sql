CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  display_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  donor_id BIGINT NOT NULL,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(500),
  category VARCHAR(64) NOT NULL,
  quantity VARCHAR(64) NOT NULL,
  pickup_address VARCHAR(255) NOT NULL,
  pickup_lat DOUBLE NOT NULL,
  pickup_lng DOUBLE NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  day_key DATE NOT NULL,
  CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES users(id)
);

CREATE TABLE requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  recipient_id BIGINT NOT NULL,
  title VARCHAR(120) NOT NULL,
  description VARCHAR(500),
  category VARCHAR(64) NOT NULL,
  quantity VARCHAR(64) NOT NULL,
  dropoff_address VARCHAR(255) NOT NULL,
  dropoff_lat DOUBLE NOT NULL,
  dropoff_lng DOUBLE NOT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  day_key DATE NOT NULL,
  CONSTRAINT fk_requests_recipient FOREIGN KEY (recipient_id) REFERENCES users(id)
);

CREATE TABLE deliveries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  donation_id BIGINT NOT NULL UNIQUE,
  request_id BIGINT NOT NULL UNIQUE,
  driver_id BIGINT NULL,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  day_key DATE NOT NULL,
  CONSTRAINT fk_deliveries_donation FOREIGN KEY (donation_id) REFERENCES donations(id),
  CONSTRAINT fk_deliveries_request FOREIGN KEY (request_id) REFERENCES requests(id),
  CONSTRAINT fk_deliveries_driver FOREIGN KEY (driver_id) REFERENCES users(id)
);

CREATE TABLE delivery_locations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  delivery_id BIGINT NOT NULL,
  lat DOUBLE NOT NULL,
  lng DOUBLE NOT NULL,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_delivery_locations_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries(id)
);

-- Seed demo users (password: demo1234)
INSERT INTO users (email, password_hash, role, display_name) VALUES
('donor@example.com', '$2b$10$WK0Ly7Eynan6pFm/0YEYOu1uwGSSPkWAL44gZdxYXy2uciNY72eUq', 'DONOR', 'Demo Donor'),
('recipient@example.com', '$2b$10$WK0Ly7Eynan6pFm/0YEYOu1uwGSSPkWAL44gZdxYXy2uciNY72eUq', 'RECIPIENT', 'Demo Recipient'),
('driver@example.com', '$2b$10$WK0Ly7Eynan6pFm/0YEYOu1uwGSSPkWAL44gZdxYXy2uciNY72eUq', 'DRIVER', 'Demo Driver'),
('admin@example.com', '$2b$10$WK0Ly7Eynan6pFm/0YEYOu1uwGSSPkWAL44gZdxYXy2uciNY72eUq', 'ADMIN', 'Demo Admin');
