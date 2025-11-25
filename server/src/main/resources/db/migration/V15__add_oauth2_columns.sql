-- Add OAuth2 related columns to users table

-- Add auth_provider column
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'local';

-- Add provider_id column for OAuth2 provider user ID
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255) NULL;

-- Add email_verified column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Make password_hash nullable for OAuth2 users
ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL;

-- Create index on provider_id for faster OAuth2 lookups
CREATE INDEX idx_users_provider_id ON users(auth_provider, provider_id);
