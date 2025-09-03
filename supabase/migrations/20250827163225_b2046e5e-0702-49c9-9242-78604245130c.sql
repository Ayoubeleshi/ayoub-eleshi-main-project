-- Fix security warnings
-- 1. Reduce OTP expiry time to recommended 10 minutes
ALTER SYSTEM SET auth.otpexpiryinterval = 600;

-- 2. Enable leaked password protection  
ALTER SYSTEM SET auth.enableLeakedPasswordProtection = true;

-- Apply configuration
SELECT pg_reload_conf();