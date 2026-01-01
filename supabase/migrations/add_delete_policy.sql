-- Add delete policy for admins
CREATE POLICY "Admins can delete registrations" 
ON public.registrations 
FOR DELETE 
USING (public.is_admin(auth.uid()));