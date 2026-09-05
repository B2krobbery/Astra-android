-- Function to handle photo request notifications
CREATE OR REPLACE FUNCTION public.handle_photo_request_notification()
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
      'PHOTO_REQUEST',
      jsonb_build_object(
        'request_id', NEW.id,
        'requester_id', NEW.requester_id,
        'requester_name', COALESCE(v_requester_name, 'A user'),
        'message', COALESCE(v_requester_name, 'A candidate') || ' requested access to view your private photos.',
        'created_at', now()
      )
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    SELECT display_name INTO v_target_name FROM public.profiles WHERE id = NEW.target_id;
    INSERT INTO public.notifications (user_id, type, content)
    VALUES (
      NEW.requester_id,
      'PHOTO_REQUEST_RESPONSE',
      jsonb_build_object(
        'request_id', NEW.id,
        'target_id', NEW.target_id,
        'target_name', COALESCE(v_target_name, 'The candidate'),
        'status', NEW.status,
        'message', COALESCE(v_target_name, 'The candidate') || ' has ' || LOWER(NEW.status) || ' your request to view private photos.',
        'created_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_photo_request_notification ON public.photo_requests;
CREATE TRIGGER trg_photo_request_notification
AFTER INSERT OR UPDATE OF status ON public.photo_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_photo_request_notification();

-- Function to handle like / interest notifications
CREATE OR REPLACE FUNCTION public.handle_interaction_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_actor_name text;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.action_type = 'LIKE' THEN
    SELECT display_name INTO v_actor_name FROM public.profiles WHERE id = NEW.actor_id;
    INSERT INTO public.notifications (user_id, type, content)
    VALUES (
      NEW.target_id,
      'INTEREST_RECEIVED',
      jsonb_build_object(
        'actor_id', NEW.actor_id,
        'actor_name', COALESCE(v_actor_name, 'A candidate'),
        'message', COALESCE(v_actor_name, 'A candidate') || ' expressed interest in your matrimonial profile.',
        'created_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_interaction_notification ON public.interactions;
CREATE TRIGGER trg_interaction_notification
AFTER INSERT ON public.interactions
FOR EACH ROW
EXECUTE FUNCTION public.handle_interaction_notification();
