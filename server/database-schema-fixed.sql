-- ADHD Study Game Database Schema
-- MySQL Database for studyshroom on Hostinger
-- NOTE: Database must be pre-created by admin

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) DEFAULT 'Player',
  currency INT DEFAULT 0,
  character_id VARCHAR(50) DEFAULT 'girl1',
  items JSON,
  total_minutes_studied INT DEFAULT 0,
  completed_sessions INT DEFAULT 0,
  pet_type VARCHAR(50),
  pet_hunger INT DEFAULT 0,
  pet_food INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_currency (currency),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  keypresses INT DEFAULT 0,
  duration INT DEFAULT 0,
  mushrooms_earned INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES players(user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  achievement_id VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES players(user_id),
  INDEX idx_user_id (user_id),
  UNIQUE KEY unique_achievement (user_id, achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  stat_date DATE NOT NULL,
  daily_keypresses INT DEFAULT 0,
  daily_sessions INT DEFAULT 0,
  daily_mushrooms INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES players(user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_stat_date (stat_date),
  UNIQUE KEY unique_daily_stat (user_id, stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Player stats view
CREATE OR REPLACE VIEW player_stats AS
SELECT 
  user_id,
  COUNT(*) as total_sessions,
  SUM(keypresses) as lifetime_keypresses,
  SUM(mushrooms_earned) as lifetime_mushrooms
FROM study_sessions
GROUP BY user_id;
