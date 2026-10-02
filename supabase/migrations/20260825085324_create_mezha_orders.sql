/*
# Create MEZHA orders table

1. New Tables
- `mezha_orders` — customer order requests from the landing page.
- `id` (uuid, primary key) — unique order identifier.
- `full_name` (text) — customer full name.
- `phone` (text) — customer phone number.
- `telegram` (text) — customer Telegram handle.
- `size` (text) — requested t-shirt size.
- `pickup_point` (text) — Europochta pickup point address.
- `product` (text) — selected t-shirt name.
- `status` (text) — order processing status.
- `created_at` (timestamptz) — submission time.

2. Security
- Row Level Security is enabled.
- Anonymous visitors may submit orders but cannot read, edit, or delete them.
- Authenticated operators may read and manage orders.

3. Notes
- This is a single-tenant storefront without customer accounts.
- Status defaults to `new` for the internal order workflow.
*/

CREATE TABLE IF NOT EXISTS public.mezha_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  telegram text NOT NULL,
  size text NOT NULL,
  pickup_point text NOT NULL,
  product text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mezha_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit MEZHA orders" ON public.mezha_orders;
CREATE POLICY "Anyone can submit MEZHA orders"
  ON public.mezha_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Operators can view MEZHA orders" ON public.mezha_orders;
CREATE POLICY "Operators can view MEZHA orders"
  ON public.mezha_orders FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Operators can update MEZHA orders" ON public.mezha_orders;
CREATE POLICY "Operators can update MEZHA orders"
  ON public.mezha_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Operators can delete MEZHA orders" ON public.mezha_orders;
CREATE POLICY "Operators can delete MEZHA orders"
  ON public.mezha_orders FOR DELETE
  TO authenticated
  USING (true);
