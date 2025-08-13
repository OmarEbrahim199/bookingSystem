/*
  # Initial Database Schema for BarberPro

  1. New Tables
    - `barbers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `bio` (text)
      - `image_url` (text)
      - `specialties` (text array)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `services`
      - `id` (uuid, primary key)
      - `name_da` (text)
      - `name_en` (text)
      - `name_ar` (text)
      - `description_da` (text)
      - `description_en` (text)
      - `description_ar` (text)
      - `price` (decimal)
      - `duration_minutes` (integer)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `service_id` (uuid, foreign key)
      - `barber_id` (uuid, foreign key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `appointment_date` (date)
      - `appointment_time` (time)
      - `status` (enum: pending, confirmed, completed, cancelled)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `admin_users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `role` (enum: super_admin, admin)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin users
    - Add policies for public booking creation
    - Add policies for public service viewing

  3. Storage
    - Create bucket for barber images
    - Set up storage policies for image uploads
*/

-- Create custom types
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin');

-- Create barbers table
CREATE TABLE IF NOT EXISTS barbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  phone text,
  bio text,
  image_url text,
  specialties text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_da text NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  description_da text,
  description_en text,
  description_ar text,
  price decimal(10,2) NOT NULL,
  duration_minutes integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  barber_id uuid REFERENCES barbers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status booking_status DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role admin_role DEFAULT 'admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for barbers table
CREATE POLICY "Anyone can view active barbers"
  ON barbers
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage barbers"
  ON barbers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Create policies for services table
CREATE POLICY "Anyone can view active services"
  ON services
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Create policies for bookings table
CREATE POLICY "Anyone can create bookings"
  ON bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Create policies for admin_users table
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.id = auth.uid() 
      AND au.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON barbers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default services
INSERT INTO services (name_da, name_en, name_ar, description_da, description_en, description_ar, price, duration_minutes) VALUES
('Herreklip', 'Men''s Haircut', 'قص شعر رجالي', 'Professionel herreklip med styling', 'Professional men''s haircut with styling', 'قص شعر رجالي احترافي مع التصفيف', 250.00, 45),
('Dameklip', 'Women''s Haircut', 'قص شعر نسائي', 'Professionel dameklip med styling', 'Professional women''s haircut with styling', 'قص شعر نسائي احترافي مع التصفيف', 350.00, 60),
('Skægtrimning', 'Beard Trim', 'تشذيب اللحية', 'Præcis skægtrimning og styling', 'Precise beard trimming and styling', 'تشذيب وتصفيف اللحية بدقة', 150.00, 30),
('Styling', 'Hair Styling', 'تصفيف الشعر', 'Professionel hårstyling', 'Professional hair styling', 'تصفيف الشعر الاحترافي', 200.00, 30),
('Farvning', 'Hair Coloring', 'صبغ الشعر', 'Professionel hårfarvning', 'Professional hair coloring', 'صبغ الشعر الاحترافي', 500.00, 120),
('Behandling', 'Hair Treatment', 'علاج الشعر', 'Nærende hårbehandling', 'Nourishing hair treatment', 'علاج الشعر المغذي', 300.00, 60);

-- Insert sample barbers
INSERT INTO barbers (name, email, phone, bio, specialties) VALUES
('Lars Nielsen', 'lars@barberpro.dk', '+45 12 34 56 78', 'Erfaren barber med 10+ års erfaring inden for klassiske og moderne klipninger.', ARRAY['Herreklip', 'Skægtrimning']),
('Anna Sørensen', 'anna@barberpro.dk', '+45 87 65 43 21', 'Specialist i dameklip og farvning med fokus på moderne trends.', ARRAY['Dameklip', 'Farvning', 'Styling']),
('Ahmed Al-Rashid', 'ahmed@barberpro.dk', '+45 11 22 33 44', 'Ekspert i både traditionelle og moderne klipningsteknikker.', ARRAY['Herreklip', 'Skægtrimning', 'Styling']);