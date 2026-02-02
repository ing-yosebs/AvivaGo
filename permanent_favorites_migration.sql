-- 1. Agregamos columna is_locked a favorites
ALTER TABLE public.favorites 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- 2. Trigger para PREVENIR eliminación si está bloqueado
CREATE OR REPLACE FUNCTION public.prevent_locked_favorite_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.is_locked = true THEN
        RAISE EXCEPTION 'No puedes eliminar a este conductor de tus favoritos porque es tu referido.';
    END IF;
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_favorite_delete_check_locked ON public.favorites;
CREATE TRIGGER on_favorite_delete_check_locked
    BEFORE DELETE ON public.favorites
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_locked_favorite_deletion();

-- 3. Actualizamos la función handle_new_user para que los nuevos inserten locked=true
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    desired_role user_role_type;
    referrer_id UUID;
    ref_code_used TEXT;
BEGIN
  -- A. Determinar rol
  BEGIN
    desired_role := (NEW.raw_user_meta_data->>'role')::user_role_type;
  EXCEPTION WHEN OTHERS THEN
    desired_role := 'client';
  END;

  -- B. Atribución de Referido
  ref_code_used := NEW.raw_user_meta_data->>'referral_code';
  IF ref_code_used IS NOT NULL THEN
     SELECT id INTO referrer_id FROM public.users WHERE referral_code = ref_code_used LIMIT 1;
  END IF;

  -- C. Insertar Usuario
  INSERT INTO public.users (id, email, full_name, avatar_url, roles, referred_by, passenger_credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sin Nombre'),
    NEW.raw_user_meta_data->>'avatar_url',
    ARRAY[desired_role],
    referrer_id,
    CASE WHEN referrer_id IS NOT NULL THEN 1 ELSE 0 END
  );
  
  -- D. Lógica de Contadores según el Rol
  IF referrer_id IS NOT NULL THEN
    IF desired_role = 'client' THEN
      UPDATE public.driver_profiles 
      SET b2c_referral_count = b2c_referral_count + 1
      WHERE user_id = referrer_id;
      
      -- [MODIFICADO] Agregar automáticamente a Favoritos y BLOQUEAR
      INSERT INTO public.favorites (user_id, driver_profile_id, is_locked)
      SELECT NEW.id, dp.id, true
      FROM public.driver_profiles dp
      WHERE dp.user_id = referrer_id
      ON CONFLICT DO NOTHING;
      
    ELSIF desired_role = 'driver' THEN
      UPDATE public.driver_profiles 
      SET referral_count_pending = referral_count_pending + 1
      WHERE user_id = referrer_id;
    END IF;
  END IF;

  -- E. Si es Conductor, crear perfil inicial
  IF desired_role = 'driver' THEN
    INSERT INTO public.driver_profiles (
        user_id, 
        profile_photo_url, 
        city, 
        whatsapp_number,
        bio,
        status
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://via.placeholder.com/150'),
        'Por Definir', 
        '0000000000',
        'Conductor nuevo',
        'draft'
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
