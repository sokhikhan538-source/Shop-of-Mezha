/*
# Add shipping method to MEZHA orders

1. Modified Tables
- `mezha_orders` — adds a required delivery method field for the customer's selected postal service.
- `shipping_method` (text) — stores either `Европочта` or `Белпочта`.

2. Data Safety
- Existing orders are preserved.
- Existing rows receive `Европочта` as the default so the new field is populated without losing historical order data.

3. Security
- Existing row-level security policies remain unchanged and continue to protect order records.
*/

ALTER TABLE public.mezha_orders
  ADD COLUMN IF NOT EXISTS shipping_method text NOT NULL DEFAULT 'Европочта';
