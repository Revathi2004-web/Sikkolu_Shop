
-- 1. Add validation constraints to orders table
ALTER TABLE public.orders
  ADD CONSTRAINT orders_name_length CHECK (length(customer_name) BETWEEN 1 AND 100),
  ADD CONSTRAINT orders_phone_format CHECK (customer_phone ~ '^\+?[0-9 \-]{7,20}$'),
  ADD CONSTRAINT orders_address_length CHECK (length(customer_address) BETWEEN 5 AND 500),
  ADD CONSTRAINT orders_total_positive CHECK (total_amount > 0),
  ADD CONSTRAINT orders_cancel_reason_length CHECK (cancel_reason IS NULL OR length(cancel_reason) <= 500),
  ADD CONSTRAINT orders_return_reason_length CHECK (return_reason IS NULL OR length(return_reason) <= 500),
  ADD CONSTRAINT orders_admin_message_length CHECK (admin_message IS NULL OR length(admin_message) <= 1000);

-- 2. Explicit deny policies for user_roles (prevent privilege escalation)
CREATE POLICY "No direct role inserts" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "No direct role updates" ON public.user_roles
  FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No direct role deletes" ON public.user_roles
  FOR DELETE TO authenticated USING (false);

-- 3. Explicit deny policies for profiles
CREATE POLICY "No manual profile inserts" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "No profile deletion" ON public.profiles
  FOR DELETE TO authenticated USING (false);

-- 4. Protect order_items immutability
CREATE POLICY "No item modification" ON public.order_items
  FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No item deletion" ON public.order_items
  FOR DELETE TO authenticated USING (false);

-- 5. Harden handle_new_user with conflict handling and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 6. Add unique constraint on user_roles if not exists (needed for ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END$$;

-- 7. Add unique constraint on profiles(user_id) if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END$$;
