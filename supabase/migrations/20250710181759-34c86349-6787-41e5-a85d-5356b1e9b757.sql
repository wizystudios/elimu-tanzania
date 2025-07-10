-- Fix infinite recursion in user_roles policies by creating proper security definer functions

-- Drop all existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can create user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their roles" ON public.user_roles;
DROP POLICY IF EXISTS "Anyone can insert user_roles" ON public.user_roles;

-- Create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.check_user_role(user_uuid uuid, required_role user_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role = required_role 
    AND is_active = true
  );
$$;

-- Create a security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role = 'super_admin' 
    AND is_active = true
  );
$$;

-- Create a security definer function to check if user is admin or higher
CREATE OR REPLACE FUNCTION public.is_admin_or_higher(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role = ANY(ARRAY['super_admin', 'admin']::user_role[])
    AND is_active = true
  );
$$;

-- Create simple, non-recursive policies using the security definer functions
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can view school roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    public.is_admin_or_higher(auth.uid()) 
    AND school_id IN (
      SELECT ur.school_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  );

CREATE POLICY "Super admins can manage all roles" 
  ON public.user_roles 
  FOR ALL
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Admins can manage school roles" 
  ON public.user_roles 
  FOR ALL
  USING (
    public.is_admin_or_higher(auth.uid()) 
    AND school_id IN (
      SELECT ur.school_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  )
  WITH CHECK (
    public.is_admin_or_higher(auth.uid()) 
    AND school_id IN (
      SELECT ur.school_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  );

-- Update schools policies to use security definer functions
DROP POLICY IF EXISTS "Users can view their own schools" ON public.schools;
DROP POLICY IF EXISTS "Enable school registration for everyone" ON public.schools;

CREATE POLICY "Super admins can view all schools" 
  ON public.schools 
  FOR SELECT 
  USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users can view their school" 
  ON public.schools 
  FOR SELECT 
  USING (
    id IN (
      SELECT ur.school_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  );

CREATE POLICY "Allow school registration" 
  ON public.schools 
  FOR INSERT 
  WITH CHECK (true);

-- Fix announcements policies
DROP POLICY IF EXISTS "School users can view announcements" ON public.announcements;

CREATE POLICY "School users can view announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    school_id IN (
      SELECT ur.school_id FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.is_active = true
    )
  );