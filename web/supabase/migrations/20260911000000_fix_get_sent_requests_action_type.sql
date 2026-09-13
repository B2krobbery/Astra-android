-- Fix get_sent_requests RPC to check i2.action_type = 'LIKE' when filtering mutual matches
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
    WHERE i2.actor_id = p.id AND i2.target_id = my_uid AND i2.action_type = 'LIKE'
  )
  LIMIT LEAST(p_limit, 50)
  OFFSET p_offset;
END;
$$;
