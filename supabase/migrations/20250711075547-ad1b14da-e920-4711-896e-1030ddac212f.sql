-- Allow anonymous users to search schools for login purposes
CREATE POLICY "Allow anonymous school search" ON public.schools
FOR SELECT
TO anon
USING (true);