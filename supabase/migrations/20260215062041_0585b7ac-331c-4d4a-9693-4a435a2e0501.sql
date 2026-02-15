
-- Replace the overly permissive customer update policy with granular policies

DROP POLICY IF EXISTS "Customers can update own orders" ON public.orders;

-- Allow cancellation only for pending/confirmed orders
CREATE POLICY "Customers can cancel pending orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status IN ('pending', 'confirmed'))
  WITH CHECK (auth.uid() = user_id AND status = 'cancelled' AND cancel_reason IS NOT NULL);

-- Allow return requests only for delivered orders
CREATE POLICY "Customers can request returns" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'delivered')
  WITH CHECK (auth.uid() = user_id AND status = 'return_requested' AND return_reason IS NOT NULL);

-- Allow payment screenshot upload only for confirmed/payment_pending orders
CREATE POLICY "Customers can upload payment proof" ON public.orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status IN ('confirmed', 'payment_pending'))
  WITH CHECK (auth.uid() = user_id AND status = 'paid' AND payment_screenshot_url IS NOT NULL);
