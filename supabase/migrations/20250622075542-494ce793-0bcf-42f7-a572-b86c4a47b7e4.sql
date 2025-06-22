
-- First, let's see what enum values exist for user_role
SELECT unnest(enum_range(NULL::user_role)) AS role_value;

-- Create RLS policies for announcements table with correct enum values
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

-- Create RLS policies for subjects table
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users can create subjects" 
  ON public.subjects 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = subjects.school_id
      AND ur.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "School users can view subjects" 
  ON public.subjects 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = subjects.school_id
    )
  );

-- Create RLS policies for classes table
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users can create classes" 
  ON public.classes 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = classes.school_id
      AND ur.role = 'admin'
    )
  );

CREATE POLICY "School users can view classes" 
  ON public.classes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = classes.school_id
    )
  );

-- Create RLS policies for exams table
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School users can create exams" 
  ON public.exams 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = exams.school_id
      AND ur.role IN ('admin', 'teacher')
    )
  );

CREATE POLICY "School users can view exams" 
  ON public.exams 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = exams.school_id
    )
  );
