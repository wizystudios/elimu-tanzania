
-- Add a phone_auth table to allow phone number as password
CREATE TABLE public.phone_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on phone_auth table
ALTER TABLE public.phone_auth ENABLE ROW LEVEL SECURITY;

-- Create policies for phone_auth table
CREATE POLICY "Users can view their own phone auth" 
  ON public.phone_auth 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phone auth" 
  ON public.phone_auth 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone auth" 
  ON public.phone_auth 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_phone_auth_user_id ON public.phone_auth(user_id);
CREATE INDEX idx_phone_auth_phone_number ON public.phone_auth(phone_number);

-- Update user_roles table to ensure proper relationships
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add trigger to update phone_auth when user is created
CREATE OR REPLACE FUNCTION public.handle_phone_auth_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user has phone number in metadata, add it to phone_auth
  IF NEW.raw_user_meta_data ? 'phone' AND NEW.raw_user_meta_data->>'phone' IS NOT NULL THEN
    INSERT INTO public.phone_auth (user_id, phone_number)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'phone')
    ON CONFLICT (phone_number) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for phone auth on user creation
DROP TRIGGER IF EXISTS on_auth_user_phone_created ON auth.users;
CREATE TRIGGER on_auth_user_phone_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_phone_auth_on_signup();

-- Update profiles table to ensure all needed fields exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- Create a view for easy user data access
CREATE OR REPLACE VIEW public.user_details AS
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.profile_image,
  p.national_id,
  p.date_of_birth,
  p.gender,
  ur.role,
  ur.teacher_role,
  ur.school_id,
  ur.is_active,
  s.name as school_name,
  pa.phone_number as auth_phone
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.schools s ON ur.school_id = s.id
LEFT JOIN public.phone_auth pa ON p.id = pa.user_id;
