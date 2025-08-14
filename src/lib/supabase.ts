import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Barber {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  image_url?: string;
  specialties: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name_da: string;
  name_en: string;
  name_ar: string;
  description_da?: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  service_id: string;
  barber_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  service?: Service;
  barber?: Barber;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Auth helpers
export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Check if user is an admin
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', data.user.id)
    .single();
    
  if (adminError) {
    // If admin user doesn't exist and this is the demo email, create one
    if (adminError.code === 'PGRST116') {
      const { data: newAdmin, error: createError } = await supabase
        .from('admin_users')
        .insert([{
          id: data.user.id,
          email: email,
          full_name: email === 'admin@barberpro.dk' ? 'Demo Admin' : 'Admin User',
          role: 'super_admin',
          is_active: true
        }])
        .select()
        .single();
        
      if (createError) {
        await supabase.auth.signOut();
        throw new Error(`Failed to create admin profile: ${createError.message}`);
      }
      
      return { user: data.user, adminUser: newAdmin };
    }
    
    await supabase.auth.signOut();
    throw new Error(`Access denied. Admin privileges required. Error: ${adminError.message}`);
  }
  
  if (!adminUser.is_active) {
    await supabase.auth.signOut();
    throw new Error('Admin account is inactive.');
  }
  
  return { user: data.user, adminUser };
};

export const signOutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error || !adminUser || !adminUser.is_active) return null;
  
  return { user, adminUser };
};

// Booking operations
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'service' | 'barber'>) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getBookings = async () => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(*),
      barber:barbers(*)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as Booking[];
};

export const updateBookingStatus = async (id: string, status: Booking['status']) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Service operations
export const getServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('created_at');
    
  if (error) throw error;
  return data as Service[];
};

// Barber operations
export const getBarbers = async () => {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .eq('is_active', true)
    .order('created_at');
    
  if (error) throw error;
  return data as Barber[];
};

export const createBarber = async (barberData: Omit<Barber, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('barbers')
    .insert([barberData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateBarber = async (id: string, barberData: Partial<Barber>) => {
  const { data, error } = await supabase
    .from('barbers')
    .update(barberData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const deleteBarber = async (id: string) => {
  const { error } = await supabase
    .from('barbers')
    .update({ is_active: false })
    .eq('id', id);
    
  if (error) throw error;
};

// Image upload
export const uploadBarberImage = async (file: File, barberId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${barberId}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('barber-images')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('barber-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};