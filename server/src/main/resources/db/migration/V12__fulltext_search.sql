-- Add FULLTEXT index for search
CREATE FULLTEXT INDEX idx_fulltext_posts ON posts(title, content_md, content_html);
