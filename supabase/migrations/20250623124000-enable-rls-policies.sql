
-- Enable RLS on remaining tables and create comprehensive policies

-- Enable RLS on classes table (if not already enabled)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for classes table
DROP POLICY IF EXISTS "School users can create classes" ON public.classes;
DROP POLICY IF EXISTS "School users can view classes" ON public.classes;
DROP POLICY IF EXISTS "School users can update classes" ON public.classes;
DROP POLICY IF EXISTS "School users can delete classes" ON public.classes;

CREATE POLICY "School users can create classes" 
  ON public.classes 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = classes.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster')
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

CREATE POLICY "School users can update classes" 
  ON public.classes 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = classes.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster')
    )
  );

CREATE POLICY "School users can delete classes" 
  ON public.classes 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = classes.school_id
      AND ur.role IN ('admin', 'headmaster')
    )
  );

-- Enable RLS on subjects table (if not already enabled)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subjects table
DROP POLICY IF EXISTS "School users can create subjects" ON public.subjects;
DROP POLICY IF EXISTS "School users can view subjects" ON public.subjects;
DROP POLICY IF EXISTS "School users can update subjects" ON public.subjects;
DROP POLICY IF EXISTS "School users can delete subjects" ON public.subjects;

CREATE POLICY "School users can create subjects" 
  ON public.subjects 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = subjects.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster', 'academic_teacher')
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

CREATE POLICY "School users can update subjects" 
  ON public.subjects 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = subjects.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster', 'academic_teacher')
    )
  );

CREATE POLICY "School users can delete subjects" 
  ON public.subjects 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = subjects.school_id
      AND ur.role IN ('admin', 'headmaster')
    )
  );

-- Enable RLS on exams table (if not already enabled)
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for exams table
DROP POLICY IF EXISTS "School users can create exams" ON public.exams;
DROP POLICY IF EXISTS "School users can view exams" ON public.exams;
DROP POLICY IF EXISTS "School users can update exams" ON public.exams;
DROP POLICY IF EXISTS "School users can delete exams" ON public.exams;

CREATE POLICY "School users can create exams" 
  ON public.exams 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = exams.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster', 'academic_teacher', 'teacher')
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

CREATE POLICY "School users can update exams" 
  ON public.exams 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = exams.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster', 'academic_teacher', 'teacher')
    )
  );

CREATE POLICY "School users can delete exams" 
  ON public.exams 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = exams.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster')
    )
  );

-- Enable RLS on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for students table
DROP POLICY IF EXISTS "School users can create students" ON public.students;
DROP POLICY IF EXISTS "School users can view students" ON public.students;
DROP POLICY IF EXISTS "School users can update students" ON public.students;
DROP POLICY IF EXISTS "School users can delete students" ON public.students;

CREATE POLICY "School users can create students" 
  ON public.students 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = students.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster')
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

CREATE POLICY "School users can update students" 
  ON public.students 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = students.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster')
    )
  );

CREATE POLICY "School users can delete students" 
  ON public.students 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = students.school_id
      AND ur.role IN ('admin', 'headmaster')
    )
  );

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "School users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "School users can create profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "School users can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur1 
      WHERE ur1.user_id = auth.uid() 
      AND ur1.role IN ('admin', 'headmaster', 'vice_headmaster')
      AND EXISTS (
        SELECT 1 FROM public.user_roles ur2 
        WHERE ur2.user_id = profiles.id 
        AND ur2.school_id = ur1.school_id
      )
    )
  );

CREATE POLICY "School users can create profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Enable RLS on user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "School admins can view user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "School admins can view user roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = user_roles.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster')
    )
  );

CREATE POLICY "School admins can manage user roles" 
  ON public.user_roles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = user_roles.school_id
      AND ur.role IN ('admin', 'headmaster')
    )
  );

-- Enable RLS on calendar_events table
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calendar_events table
DROP POLICY IF EXISTS "School users can create events" ON public.calendar_events;
DROP POLICY IF EXISTS "School users can view events" ON public.calendar_events;
DROP POLICY IF EXISTS "School users can update events" ON public.calendar_events;
DROP POLICY IF EXISTS "School users can delete events" ON public.calendar_events;

CREATE POLICY "School users can create events" 
  ON public.calendar_events 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = calendar_events.school_id
      AND ur.role IN ('admin', 'headmaster', 'vice_headmaster', 'academic_teacher', 'teacher')
    )
  );

CREATE POLICY "School users can view events" 
  ON public.calendar_events 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = calendar_events.school_id
    )
  );

CREATE POLICY "School users can update events" 
  ON public.calendar_events 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = calendar_events.school_id
      AND (ur.role IN ('admin', 'headmaster', 'vice_headmaster') OR ur.user_id = calendar_events.created_by)
    )
  );

CREATE POLICY "School users can delete events" 
  ON public.calendar_events 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.school_id = calendar_events.school_id
      AND (ur.role IN ('admin', 'headmaster', 'vice_headmaster') OR ur.user_id = calendar_events.created_by)
    )
  );
