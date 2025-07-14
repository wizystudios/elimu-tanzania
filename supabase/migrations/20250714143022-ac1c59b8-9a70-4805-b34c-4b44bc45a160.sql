-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view school roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage school roles" ON public.user_roles;

-- Create security definer functions to safely query user_roles
CREATE OR REPLACE FUNCTION public.get_user_schools(check_user_id uuid)
RETURNS TABLE(school_id uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT ur.school_id 
  FROM public.user_roles ur 
  WHERE ur.user_id = check_user_id AND ur.is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.user_is_admin_in_school(check_user_id uuid, check_school_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = check_user_id 
    AND ur.school_id = check_school_id
    AND ur.role = ANY(ARRAY['admin'::user_role, 'super_admin'::user_role])
    AND ur.is_active = true
  );
$$;

-- Recreate policies using the security definer functions
CREATE POLICY "Admins can view school roles" ON public.user_roles
FOR SELECT 
USING (
  public.user_is_admin_in_school(auth.uid(), school_id)
);

CREATE POLICY "Admins can manage school roles" ON public.user_roles
FOR ALL
USING (
  public.user_is_admin_in_school(auth.uid(), school_id)
)
WITH CHECK (
  public.user_is_admin_in_school(auth.uid(), school_id)
);