-- Add shipping flag to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS is_shipping boolean NOT NULL DEFAULT false;

NOTIFY pgrst, 'reload schema';
