/*
  # Fix Admin Users RLS Policies

  1. Security Updates
    - Remove problematic recursive policies
    - Add simple, non-recursive policies for admin_users table
    - Ensure policies don't create circular dependencies

  2. Policy Changes
    - Allow authenticated users to read their own admin profile
    - Allow super admins to manage all admin users
    - Remove any policies that could cause infinite recursion
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own admin profile"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@barberpro.dk'
    )
  );

-- Ensure the admin user exists in auth.users (this is just a check, actual user creation must be done via Supabase Auth)
-- The admin user should be created through Supabase Dashboard or Auth API