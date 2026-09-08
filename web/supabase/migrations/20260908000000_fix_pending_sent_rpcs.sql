-- Fix get_pending_requests and get_sent_requests RPC column count mismatch (Error 42804)
DROP FUNCTION IF EXISTS public.get_pending_requests(int, int);
DROP FUNCTION IF EXISTS public.get_pending_requests();

CREATE OR REPLACE FUNCTION public.get_pending_requests(p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_uid uuid;
BEGIN
  my_uid := auth.uid();
  
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  JOIN public.interactions i ON i.actor_id = p.id
  WHERE i.target_id = my_uid
  AND i.action_type = 'LIKE'
  AND NOT EXISTS (
    SELECT 1 FROM public.interactions i2
    WHERE i2.actor_id = my_uid AND i2.target_id = p.id
  )
  LIMIT LEAST(p_limit, 50)
  OFFSET p_offset;
END;
$$;

DROP FUNCTION IF EXISTS public.get_sent_requests(int, int);
DROP FUNCTION IF EXISTS public.get_sent_requests();

CREATE OR REPLACE FUNCTION public.get_sent_requests(p_limit int DEFAULT 50, p_offset int DEFAULT 0)
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_uid uuid;
BEGIN
  my_uid := auth.uid();
  
  RETURN QUERY
  SELECT p.*
  FROM public.profiles p
  JOIN public.interactions i ON i.actor_id = my_uid
  WHERE i.target_id = p.id
  AND i.action_type = 'LIKE'
  AND NOT EXISTS (
    SELECT 1 FROM public.interactions i2
    WHERE i2.actor_id = p.id AND i2.target_id = my_uid
  )
  LIMIT LEAST(p_limit, 50)
  OFFSET p_offset;
END;
$$;
