-- Add tiered prices (10, 20, 30 pieces) to products and product_sets.
-- Existing single-piece price is copied into the three new columns so no
-- existing record loses its price information.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS price_10 numeric(12, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_20 numeric(12, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_30 numeric(12, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.product_sets
ADD COLUMN IF NOT EXISTS price_10 numeric(12, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_20 numeric(12, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_30 numeric(12, 2) NOT NULL DEFAULT 0;

UPDATE public.products
SET price_10 = price_per_piece,
    price_20 = price_per_piece,
    price_30 = price_per_piece
WHERE price_10 = 0 AND price_20 = 0 AND price_30 = 0;

UPDATE public.product_sets
SET price_10 = price_per_set,
    price_20 = price_per_set,
    price_30 = price_per_set
WHERE price_10 = 0 AND price_20 = 0 AND price_30 = 0;

NOTIFY pgrst, 'reload schema';
