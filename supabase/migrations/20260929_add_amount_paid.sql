-- Add amount_paid column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS amount_paid numeric(12, 2) NOT NULL DEFAULT 0;

NOTIFY pgrst, 'reload schema';
