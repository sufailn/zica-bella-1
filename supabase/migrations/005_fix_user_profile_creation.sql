-- Fix the user profile creation trigger to extract metadata properly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    CASE 
      WHEN NEW.email LIKE '%admin%' THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a policy to allow creating user profiles during signup
CREATE POLICY "Allow profile creation during signup" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Also allow service role to read and update user profiles for API operations
CREATE POLICY "Service role can manage all profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Update existing users who might not have profiles yet
-- (Run this only if you have users without profiles)
INSERT INTO public.user_profiles (id, email, role)
SELECT 
  au.id,
  au.email,
  'customer'
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING; 