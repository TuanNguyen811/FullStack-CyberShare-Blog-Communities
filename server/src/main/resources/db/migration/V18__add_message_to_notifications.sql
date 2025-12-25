-- Add message column to notifications for system messages
ALTER TABLE notifications ADD COLUMN message TEXT;
