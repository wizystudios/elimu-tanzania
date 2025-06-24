
-- First, create a security definer function to get user role safely
CREATE OR REPLACE FUNCTION public.get_user_role_safe(check_user_id uuid, check_school_id uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = check_user_id AND school_id = check_school_id
  LIMIT 1;
$$;

-- Drop all problematic policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can view school user roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can create user roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can delete user roles" ON public.user_roles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can create user roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update user roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can delete user roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
    )
  );
