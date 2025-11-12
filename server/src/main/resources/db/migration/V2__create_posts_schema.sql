-- V2: Insert default categories
-- Tables already exist from V1, we just need to populate categories

-- Insert default categories (ignore if already exist)
INSERT IGNORE INTO categories (name, slug, description) VALUES
('Technology', 'technology', 'Articles about technology, programming, and software development'),
('Lifestyle', 'lifestyle', 'Personal experiences, health, and daily life'),
('Business', 'business', 'Entrepreneurship, startups, and business strategies'),
('Design', 'design', 'UI/UX design, graphic design, and creative work'),
('Science', 'science', 'Scientific discoveries and research'),
('Education', 'education', 'Learning resources and educational content');
