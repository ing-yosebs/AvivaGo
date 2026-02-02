-- Drop the FK to auth.users
ALTER TABLE public.quote_requests
  DROP CONSTRAINT quote_requests_passenger_id_fkey;

-- Add the FK to public.users
ALTER TABLE public.quote_requests
  ADD CONSTRAINT quote_requests_passenger_id_fkey
  FOREIGN KEY (passenger_id)
  REFERENCES public.users(id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;
