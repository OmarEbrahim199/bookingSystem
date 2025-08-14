/*
  # Fix Admin User Policies

  1. Security Updates
    - Drop problematic policies that reference auth.users
    - Create simple, working policies for admin_users table
    - Enable proper RLS without circular dependencies

  2. Policy Changes
    - Allow authenticated users to read their own admin profile
    - Allow admin creation for demo purposes
    - Remove references to auth.users table that cause permission errors
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Users can read own admin profile" ON admin_users;

-- Create simple, working policies
CREATE POLICY "Allow authenticated users to read own admin profile"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow authenticated users to insert own admin profile"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated users to update own admin profile"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);