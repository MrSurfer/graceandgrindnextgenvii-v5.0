-- Drop and recreate the trigger function that syncs auth.users → public."User"
-- Using SECURITY DEFINER to bypass RLS on the User table

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public."User" (
    id,
    email,
    name,
    role,
    status,
    "supabaseAuthId",
    permissions,
    "createdAt",
    "updatedAt"
  )
  VALUES (
    gen_random_uuid()::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'CUSTOMER'),
    'ACTIVE',
    NEW.id::text,
    ARRAY[]::text[],
    now(),
    now()
  )
  ON CONFLICT ("supabaseAuthId") DO NOTHING;

  RETURN NEW;
END;
$$;

-- Drop old trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
