-- Safely add created_at to tags if it doesn't exist
SET @exist := (SELECT count(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'tags' AND column_name = 'created_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE tags ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop and recreate notifications table
DROP TABLE IF EXISTS notifications;

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id BIGINT NOT NULL,
    actor_id BIGINT,
    type VARCHAR(20) NOT NULL,
    entity_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, is_read);
