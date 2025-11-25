-- Fix Flyway migration V13 issue
-- Run this SQL in your MySQL database

-- Option 1: Delete the failed migration record
DELETE FROM flyway_schema_history WHERE version = '13' AND success = 0;

-- Then restart the server, and Flyway will re-run V13 with the fixed script

-- Option 2: If you want to mark it as successful (only if tables are correct)
-- UPDATE flyway_schema_history SET success = 1 WHERE version = '13';
