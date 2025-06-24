
-- First, let's see what enum values exist for user_role
SELECT unnest(enum_range(NULL::user_role)) AS role_value;

-- Drop the problematic policies first
DROP POLICY IF EXISTS "School admins can view school profiles" ON public.profiles;
DROP POLICY IF EXISTS "School admins can create students" ON public.students;
DROP POLICY IF EXISTS "School users can view students" ON public.students;
DROP POLICY IF EXISTS "School admins can update students" ON public.students;
DROP POLICY IF EXISTS "School admins can delete students" ON public.students;
DROP POLICY IF EXISTS "School admins can view school user roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can create user roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can update user roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can delete user roles" ON public.user_roles;
DROP POLICY IF EXISTS "School staff can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Announcement creators and admins can update" ON public.announcements;
DROP POLICY IF EXISTS "Announcement creators and admins can delete" ON public.announcements;

-- Now create policies with the correct enum values
CREATE POLICY "School admins can view school profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur1 
      WHERE ur1.user_id = auth.uid() 
      AND ur1.role IN ('super_admin', 'admin')
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur2 
        WHERE ur2.user_id = profiles.id 
        AND ur2.school_id = ur1.school_id
      )
    )
  );

-- Students table policies with correct enum values
CREATE POLICY "School admins can create students" 
  ON public.students 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = students.school_id
      AND ur.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "School users can view students" 
  ON public.students 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = students.school_id
    )
  );

CREATE POLICY "School admins can update students" 
  ON public.students 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = students.school_id
      AND ur.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "School admins can delete students" 
  ON public.students 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = students.school_id
      AND ur.role IN ('super_admin', 'admin')
    )
  );

-- User roles table policies with correct enum values
CREATE POLICY "School admins can view school user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = user_roles.school_id
      AND ur.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "School admins can create user roles" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = user_roles.school_id
      AND ur.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "School admins can update user roles" 
  ON public.user_roles 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = user_roles.school_id
      AND ur.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "School admins can delete user roles" 
  ON public.user_roles 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = user_roles.school_id
      AND ur.role IN ('super_admin', 'admin')
    )
  );

-- Announcements table policies with correct enum values
CREATE POLICY "School staff can create announcements" 
  ON public.announcements 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = announcements.school_id
      AND ur.role IN ('super_admin', 'admin', 'teacher')
    )
  );

CREATE POLICY "Announcement creators and admins can update" 
  ON public.announcements 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = announcements.school_id
      AND (ur.role IN ('super_admin', 'admin') OR ur.user_id = announcements.sender_id)
    )
  );

CREATE POLICY "Announcement creators and admins can delete" 
  ON public.announcements 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = announcements.school_id
      AND (ur.role IN ('super_admin', 'admin') OR ur.user_id = announcements.sender_id)
    )
  );
