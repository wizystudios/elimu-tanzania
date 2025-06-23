
-- Fix the announcements recipient_type constraint first
ALTER TABLE public.announcements DROP CONSTRAINT IF EXISTS announcements_recipient_type_check;

-- Add a proper check constraint with the correct values
ALTER TABLE public.announcements ADD CONSTRAINT announcements_recipient_type_check 
CHECK (recipient_type IN ('all_school', 'teachers', 'students', 'parents', 'class'));

-- For now, let's update the RLS policies to be more permissive 
-- We'll handle the enum values in a separate step
DROP POLICY IF EXISTS "School users can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "School users can view announcements" ON public.announcements;

CREATE POLICY "School users can create announcements" 
  ON public.announcements 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = announcements.school_id
      AND ur.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "School users can view announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = announcements.school_id
    )
  );
