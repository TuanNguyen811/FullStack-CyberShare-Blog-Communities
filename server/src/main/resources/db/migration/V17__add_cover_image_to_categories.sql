-- Add cover image URL to categories table
ALTER TABLE categories ADD COLUMN cover_image_url VARCHAR(500) NULL;
