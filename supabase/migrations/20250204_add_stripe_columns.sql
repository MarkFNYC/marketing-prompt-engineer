-- Migration: Add Stripe columns to profiles table
-- Date: 2025-02-04
-- Description: Adds stripe_customer_id and stripe_subscription_id for payment integration

-- Add Stripe columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- Add index for faster Stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- Add comments for documentation
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Stripe subscription ID for active subscription';
