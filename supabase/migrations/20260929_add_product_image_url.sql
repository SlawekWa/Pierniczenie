-- Add image_url column to products table (link to a photo stored in a bucket)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image_url text;

-- Add is_available_solo column to products table (product can be sold outside sets)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_available_solo boolean NOT NULL DEFAULT true;

-- Add image_url column to product_sets table (link to a photo stored in a bucket)
ALTER TABLE public.product_sets
ADD COLUMN IF NOT EXISTS image_url text;

NOTIFY pgrst, 'reload schema';
