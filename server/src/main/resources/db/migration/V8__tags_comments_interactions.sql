-- V8: Add interaction counters to posts table
-- Note: Tables tags, comments, likes, bookmarks already exist from previous setup

-- Add interaction counters to posts table
ALTER TABLE posts
ADD COLUMN likes_count INT DEFAULT 0 NOT NULL AFTER views,
ADD COLUMN comments_count INT DEFAULT 0 NOT NULL AFTER likes_count,
ADD COLUMN bookmarks_count INT DEFAULT 0 NOT NULL AFTER comments_count,
ADD INDEX idx_posts_likes (likes_count DESC),
ADD INDEX idx_posts_comments (comments_count DESC);

