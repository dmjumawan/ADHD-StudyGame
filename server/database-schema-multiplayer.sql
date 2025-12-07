-- ADHD Study Game Database Schema - Multiplayer Update
-- MySQL Database for studyshroom on Hostinger
-- Add these tables to existing database

-- Player presence table (tracks who's online and where)
CREATE TABLE IF NOT EXISTS player_presence (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  character_id VARCHAR(50) DEFAULT 'girl1',
  pet_type VARCHAR(50),
  location VARCHAR(50) DEFAULT 'world', -- 'world' or 'cafe'
  x INT DEFAULT 0,
  y INT DEFAULT 0,
  last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES players(user_id),
  UNIQUE KEY unique_user_presence (user_id),
  INDEX idx_last_heartbeat (last_heartbeat),
  INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  location VARCHAR(50) DEFAULT 'cafe', -- 'cafe' or future locations
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES players(user_id),
  INDEX idx_location_created (location, created_at),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up old presence records (optional - run periodically)
-- DELETE FROM player_presence WHERE last_heartbeat < DATE_SUB(NOW(), INTERVAL 5 MINUTE);
