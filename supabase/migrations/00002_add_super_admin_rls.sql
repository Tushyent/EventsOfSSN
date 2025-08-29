-- Add policies for Super Admins

-- Allow Super Admins to view all events (including pending ones)
CREATE POLICY "Super Admins can view all events" ON public.events FOR SELECT USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'::user_role
);

-- Allow Super Admins to update events (e.g. approve/reject)
CREATE POLICY "Super Admins can update events" ON public.events FOR UPDATE USING (
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin'::user_role
);
