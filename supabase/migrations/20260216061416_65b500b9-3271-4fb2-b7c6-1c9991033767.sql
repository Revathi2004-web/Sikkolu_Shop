
-- Create product_reviews table
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT DEFAULT '',
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.product_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.product_reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage reviews" ON public.product_reviews FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_reviews;
