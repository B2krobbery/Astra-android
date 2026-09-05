-- 20260905000013_chaanbean_rls_and_notifications.sql
-- Allow target users to update consent on Chaanbean verification requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chaanbean_requests' 
    AND policyname = 'Users can update consent for their own chaanbean requests'
  ) THEN
    CREATE POLICY "Users can update consent for their own chaanbean requests"
    ON public.chaanbean_requests
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = target_id)
    WITH CHECK (auth.uid() = target_id);
  END IF;
END $$;

-- Trigger to notify target user when verification is requested, and notify requester on consent response
CREATE OR REPLACE FUNCTION public.handle_chaanbean_request_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_requester_name text;
  v_target_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT display_name INTO v_requester_name FROM public.profiles WHERE id = NEW.requester_id;
    INSERT INTO public.notifications (user_id, type, content)
    VALUES (
      NEW.target_id,
      'CHAANBEAN_CONSENT_REQUEST',
      jsonb_build_object(
        'request_id', NEW.id,
        'requester_id', NEW.requester_id,
        'requester_name', COALESCE(v_requester_name, 'A user'),
        'checks_requested', NEW.checks_requested,
        'message', COALESCE(v_requester_name, 'A match') || ' has requested background verification (Chaanbean™). Your consent is required to proceed.',
        'created_at', now()
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.consent_granted != NEW.consent_granted THEN
    SELECT display_name INTO v_target_name FROM public.profiles WHERE id = NEW.target_id;
    INSERT INTO public.notifications (user_id, type, content)
    VALUES (
      NEW.requester_id,
      'CHAANBEAN_CONSENT_RESPONSE',
      jsonb_build_object(
        'request_id', NEW.id,
        'target_id', NEW.target_id,
        'target_name', COALESCE(v_target_name, 'The candidate'),
        'consent_granted', NEW.consent_granted,
        'message', COALESCE(v_target_name, 'The candidate') || CASE WHEN NEW.consent_granted THEN ' granted' ELSE ' declined' END || ' consent for background verification.',
        'created_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_chaanbean_request_notification ON public.chaanbean_requests;
CREATE TRIGGER trg_chaanbean_request_notification
AFTER INSERT OR UPDATE OF consent_granted ON public.chaanbean_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_chaanbean_request_notification();
