-- Add created_at to tags
ALTER TABLE tags ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create post_views table
CREATE TABLE post_views (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_post_user ON post_views(post_id, user_id);
CREATE INDEX idx_post_ip ON post_views(post_id, ip_address);
