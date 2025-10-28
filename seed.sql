USE wedding_app;
-- password hash for "password123"
INSERT INTO users (username, password_hash, role) VALUES
  ('admin@example.com', '$2a$10$A1gHeJlNQUvCwmfe3mWpkOLW5WVLY26HVRhXo7IwL9DsMZYkxwd9y', 'admin'),
  ('staff', '$2a$10$gH1Oa8tWw1b1b1mZ1F3n8uS8m2nSJm6Tz7mQy5pQvQ3i3Jr8l7c5i', 'user');

INSERT INTO guests (name, status, code) VALUES
  ('Chan Dara', 'invited', '5FJevxWBaR'),
  ('Sokha Meas', 'confirmed', 'A1B2C3D4E5'),
  ('Vannak Phan', 'unknown', 'ZZYYXX1122');
