ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS production_completed_products text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS unit_price numeric(12, 2) NOT NULL DEFAULT 0;

WITH catalog_prices AS (
	SELECT
		order_item.id,
		order_item.order_id,
		order_item.quantity,
		COALESCE(product.price_per_piece, product_set.price_per_set, 0)::numeric AS catalog_unit_price
	FROM public.order_items AS order_item
	LEFT JOIN public.products AS product ON product.id = order_item.product_id
	LEFT JOIN public.product_sets AS product_set ON product_set.id = order_item.set_id
), order_totals AS (
	SELECT
		catalog_prices.order_id,
		SUM(catalog_prices.catalog_unit_price * catalog_prices.quantity) AS catalog_total,
		SUM(catalog_prices.quantity) AS item_quantity,
		COALESCE(MAX(orders.total_price), 0)::numeric AS saved_total
	FROM catalog_prices
	JOIN public.orders AS orders ON orders.id = catalog_prices.order_id
	GROUP BY catalog_prices.order_id
)
UPDATE public.order_items AS order_item
SET unit_price = CASE
	WHEN order_totals.catalog_total > 0
		THEN ROUND(catalog_prices.catalog_unit_price * order_totals.saved_total / order_totals.catalog_total, 2)
	WHEN order_totals.item_quantity > 0
		THEN ROUND(order_totals.saved_total / order_totals.item_quantity, 2)
	ELSE 0
END
FROM catalog_prices
JOIN order_totals ON order_totals.order_id = catalog_prices.order_id
WHERE order_item.id = catalog_prices.id
	AND order_item.unit_price = 0;

NOTIFY pgrst, 'reload schema';