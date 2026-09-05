-- 20260905000016_fix_conversation_recursion.sql
-- Fix infinite recursion between conversations and conversation_participants policies

DROP POLICY IF EXISTS "Users can view conversations they are part of" ON public.conversations;
DROP POLICY IF EXISTS "Users can view conversations for their matches" ON public.conversations;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;

-- Acyclic policy on conversations: references matches directly instead of querying conversation_participants
CREATE POLICY "Users can view conversations for their matches"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches m
    WHERE m.id = conversations.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- Acyclic policy on conversation_participants:
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.conversations c
    JOIN public.matches m ON c.match_id = m.id
    WHERE c.id = conversation_participants.conversation_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);
