-- Fix follows table: add id column as primary key
-- First, need to drop foreign key constraints before dropping primary key
ALTER TABLE follows DROP FOREIGN KEY follows_ibfk_1;
ALTER TABLE follows DROP FOREIGN KEY follows_ibfk_2;

-- Drop the existing primary key constraint
ALTER TABLE follows DROP PRIMARY KEY;

-- Add id column as auto increment primary key
ALTER TABLE follows ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST;

-- Re-add unique constraint for follower_id and following_id
ALTER TABLE follows ADD UNIQUE KEY uk_follower_following (follower_id, following_id);

-- Re-add the foreign key constraints
ALTER TABLE follows ADD CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE follows ADD CONSTRAINT fk_follows_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE;
