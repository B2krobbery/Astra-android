-- 1. Fix data integrity bug on conversations (cleanup duplicates first)
DELETE FROM public.conversation_participants
WHERE conversation_id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (PARTITION BY match_id ORDER BY created_at ASC) as rn
    FROM public.conversations
  ) t WHERE rn > 1
);

DELETE FROM public.messages
WHERE conversation_id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (PARTITION BY match_id ORDER BY created_at ASC) as rn
    FROM public.conversations
  ) t WHERE rn > 1
);

DELETE FROM public.conversations
WHERE id IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (PARTITION BY match_id ORDER BY created_at ASC) as rn
    FROM public.conversations
  ) t WHERE rn > 1
);

ALTER TABLE public.conversations ADD CONSTRAINT conversations_match_id_key UNIQUE (match_id);

-- 2. Secure profiles RLS
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view matches profiles" ON public.profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE (m.user1_id = auth.uid() AND m.user2_id = profiles.id)
       OR (m.user2_id = auth.uid() AND m.user1_id = profiles.id)
  )
);

-- 3. Secure conversation_participants RLS
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;

CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
FOR SELECT USING (
  conversation_id IN (
    SELECT c.id FROM public.conversations c
    JOIN public.matches m ON c.match_id = m.id
    WHERE m.user1_id = auth.uid() OR m.user2_id = auth.uid()
  )
);

-- 4. Fix SECURITY DEFINER search_path vulnerability for RPCs
ALTER FUNCTION public.get_discovery_candidates() SET search_path = public;
ALTER FUNCTION public.get_pending_requests() SET search_path = public;
ALTER FUNCTION public.get_sent_requests() SET search_path = public;
ALTER FUNCTION public.check_mutual_match() SET search_path = public;

