-- =============================================================================
-- ChadConnect — Supabase schema
-- Paste into: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------

CREATE TYPE public.need_type AS ENUM (
  'housing',
  'rides',
  'study',
  'networking',
  'general'
);

CREATE TYPE public.event_type AS ENUM (
  'internship',
  'hackathon',
  'conference',
  'meetup',
  'other'
);

CREATE TYPE public.housing_type AS ENUM (
  'seeking-roommate',
  'offering-spot',
  'looking-for-place'
);

CREATE TYPE public.ride_type AS ENUM (
  'offering',
  'requesting'
);

CREATE TYPE public.notification_type AS ENUM (
  'message',
  'connection',
  'housing',
  'ride',
  'event',
  'system'
);

CREATE TYPE public.feed_item_type AS ENUM (
  'housing',
  'ride',
  'event',
  'connection'
);

CREATE TYPE public.conversation_context_type AS ENUM (
  'housing',
  'ride',
  'event',
  'general'
);

CREATE TYPE public.connection_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'blocked'
);

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT '',
  university text NOT NULL DEFAULT '',
  major text NOT NULL DEFAULT '',
  graduation_year integer,
  avatar_url text,
  bio text,
  needs public.need_type[] NOT NULL DEFAULT '{}',
  city text,
  state text,
  country text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type public.event_type NOT NULL,
  organization text NOT NULL,
  city text NOT NULL,
  state text,
  country text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text NOT NULL DEFAULT '',
  attendee_count integer NOT NULL DEFAULT 0,
  image_url text,
  tags text[] NOT NULL DEFAULT '{}',
  created_by uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_dates_check CHECK (end_date >= start_date),
  CONSTRAINT events_attendee_count_nonneg CHECK (attendee_count >= 0)
);

CREATE TABLE public.event_attendees (
  event_id uuid NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

CREATE TABLE public.housing_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type public.housing_type NOT NULL,
  event_id uuid REFERENCES public.events (id) ON DELETE SET NULL,
  city text NOT NULL,
  state text,
  country text NOT NULL,
  budget_min numeric,
  budget_max numeric,
  move_in_date date NOT NULL,
  move_out_date date,
  description text NOT NULL DEFAULT '',
  preferences text[] NOT NULL DEFAULT '{}',
  author_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT housing_budget_check CHECK (
    budget_min IS NULL
    OR budget_max IS NULL
    OR budget_max >= budget_min
  ),
  CONSTRAINT housing_dates_check CHECK (
    move_out_date IS NULL
    OR move_out_date >= move_in_date
  )
);

CREATE TABLE public.ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.ride_type NOT NULL,
  event_id uuid REFERENCES public.events (id) ON DELETE SET NULL,
  from_text text NOT NULL,
  to_text text NOT NULL,
  departure_time timestamptz NOT NULL,
  seats_available integer,
  cost_per_person numeric,
  description text NOT NULL DEFAULT '',
  author_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ride_seats_nonneg CHECK (
    seats_available IS NULL
    OR seats_available >= 0
  ),
  CONSTRAINT ride_cost_nonneg CHECK (
    cost_per_person IS NULL
    OR cost_per_person >= 0
  )
);

CREATE TABLE public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  status public.connection_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT connections_no_self CHECK (requester_id <> addressee_id)
);

CREATE UNIQUE INDEX connections_pair_unique
  ON public.connections (
    LEAST(requester_id, addressee_id),
    GREATEST(requester_id, addressee_id)
  );

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type public.conversation_context_type,
  context_id uuid,
  context_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  unread_count integer NOT NULL DEFAULT 0,
  last_read_at timestamptz,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT conversation_unread_nonneg CHECK (unread_count >= 0)
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT messages_content_not_empty CHECK (char_length(trim(content)) > 0)
);

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.feed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.feed_item_type NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  author_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX events_type_idx ON public.events (type);
CREATE INDEX events_start_date_idx ON public.events (start_date);
CREATE INDEX events_created_by_idx ON public.events (created_by);
CREATE INDEX events_city_idx ON public.events (city);

CREATE INDEX event_attendees_user_id_idx ON public.event_attendees (user_id);

CREATE INDEX housing_posts_type_idx ON public.housing_posts (type);
CREATE INDEX housing_posts_event_id_idx ON public.housing_posts (event_id);
CREATE INDEX housing_posts_author_id_idx ON public.housing_posts (author_id);
CREATE INDEX housing_posts_city_idx ON public.housing_posts (city);
CREATE INDEX housing_posts_created_at_idx ON public.housing_posts (created_at DESC);

CREATE INDEX ride_requests_type_idx ON public.ride_requests (type);
CREATE INDEX ride_requests_event_id_idx ON public.ride_requests (event_id);
CREATE INDEX ride_requests_author_id_idx ON public.ride_requests (author_id);
CREATE INDEX ride_requests_departure_time_idx ON public.ride_requests (departure_time);

CREATE INDEX connections_requester_id_idx ON public.connections (requester_id);
CREATE INDEX connections_addressee_id_idx ON public.connections (addressee_id);
CREATE INDEX connections_status_idx ON public.connections (status);

CREATE INDEX conversation_participants_user_id_idx
  ON public.conversation_participants (user_id);

CREATE INDEX messages_conversation_created_idx
  ON public.messages (conversation_id, created_at DESC);
CREATE INDEX messages_sender_id_idx ON public.messages (sender_id);

CREATE INDEX notifications_user_read_created_idx
  ON public.notifications (user_id, read, created_at DESC);

CREATE INDEX feed_items_created_at_idx ON public.feed_items (created_at DESC);
CREATE INDEX feed_items_author_id_idx ON public.feed_items (author_id);
CREATE INDEX feed_items_type_idx ON public.feed_items (type);

-- ---------------------------------------------------------------------------
-- 4. Helper functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = p_conversation_id
      AND cp.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.profile_display_name(p_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(NULLIF(trim(p.name), ''), split_part(p.email, '@', 1))
  FROM public.profiles p
  WHERE p.id = p_user_id;
$$;

-- ---------------------------------------------------------------------------
-- 5. Auth → profile bootstrap
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE((NEW.email_confirmed_at IS NOT NULL), false)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 6. updated_at triggers
-- ---------------------------------------------------------------------------

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER connections_set_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER conversations_set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. Event attendee count sync
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_event_attendee_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_event_id uuid;
BEGIN
  target_event_id := COALESCE(NEW.event_id, OLD.event_id);

  UPDATE public.events e
  SET attendee_count = (
    SELECT count(*)::integer
    FROM public.event_attendees ea
    WHERE ea.event_id = target_event_id
  )
  WHERE e.id = target_event_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER event_attendees_sync_count
  AFTER INSERT OR DELETE ON public.event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_event_attendee_count();

-- ---------------------------------------------------------------------------
-- 8. Feed item writers (security definer — bypass RLS for trigger inserts)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.on_event_created_feed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.feed_items (type, title, subtitle, author_id, metadata, related_id)
  VALUES (
    'event',
    NEW.title,
    NEW.organization || ' · ' || NEW.city,
    NEW.created_by,
    jsonb_build_object(
      'eventType', NEW.type::text,
      'city', NEW.city,
      'organization', NEW.organization
    ),
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_feed_item
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.on_event_created_feed();

CREATE OR REPLACE FUNCTION public.on_housing_created_feed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.feed_items (type, title, subtitle, author_id, metadata, related_id)
  VALUES (
    'housing',
    NEW.title,
    NEW.type::text || ' · ' || NEW.city,
    NEW.author_id,
    jsonb_build_object(
      'housingType', NEW.type::text,
      'city', NEW.city,
      'budgetMin', NEW.budget_min,
      'budgetMax', NEW.budget_max
    ),
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER housing_posts_feed_item
  AFTER INSERT ON public.housing_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.on_housing_created_feed();

CREATE OR REPLACE FUNCTION public.on_ride_created_feed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.feed_items (type, title, subtitle, author_id, metadata, related_id)
  VALUES (
    'ride',
    NEW.from_text || ' → ' || NEW.to_text,
    NEW.type::text,
    NEW.author_id,
    jsonb_build_object(
      'rideType', NEW.type::text,
      'from', NEW.from_text,
      'to', NEW.to_text,
      'departureTime', NEW.departure_time
    ),
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER ride_requests_feed_item
  AFTER INSERT ON public.ride_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.on_ride_created_feed();

-- ---------------------------------------------------------------------------
-- 9. Connection accept → feed + notifications
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.on_connection_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_name text;
  addressee_name text;
BEGIN
  IF NEW.status = 'accepted'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'accepted') THEN
    requester_name := public.profile_display_name(NEW.requester_id);
    addressee_name := public.profile_display_name(NEW.addressee_id);

    INSERT INTO public.feed_items (type, title, subtitle, author_id, metadata, related_id)
    VALUES (
      'connection',
      requester_name || ' connected with ' || addressee_name,
      'New connection',
      NEW.requester_id,
      jsonb_build_object(
        'requesterId', NEW.requester_id,
        'addresseeId', NEW.addressee_id
      ),
      NEW.id
    );

    INSERT INTO public.notifications (user_id, type, title, body, related_id)
    VALUES
      (
        NEW.requester_id,
        'connection',
        'Connection accepted',
        addressee_name || ' accepted your connection request.',
        NEW.id
      ),
      (
        NEW.addressee_id,
        'connection',
        'New connection',
        'You are now connected with ' || requester_name || '.',
        NEW.id
      );
  END IF;

  -- Notify addressee when a new pending request is created
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    requester_name := public.profile_display_name(NEW.requester_id);

    INSERT INTO public.notifications (user_id, type, title, body, related_id)
    VALUES (
      NEW.addressee_id,
      'connection',
      'Connection request',
      requester_name || ' wants to connect with you.',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER connections_status_side_effects
  AFTER INSERT OR UPDATE OF status ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.on_connection_status_change();

-- ---------------------------------------------------------------------------
-- 10. Message insert → conversation bump, unread, notification
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.on_message_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name text;
  preview text;
BEGIN
  UPDATE public.conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;

  UPDATE public.conversation_participants
  SET unread_count = unread_count + 1
  WHERE conversation_id = NEW.conversation_id
    AND user_id <> NEW.sender_id;

  sender_name := public.profile_display_name(NEW.sender_id);
  preview := left(NEW.content, 120);

  INSERT INTO public.notifications (user_id, type, title, body, related_id)
  SELECT
    cp.user_id,
    'message',
    'Message from ' || sender_name,
    preview,
    NEW.conversation_id
  FROM public.conversation_participants cp
  WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id <> NEW.sender_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_after_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.on_message_insert();

-- ---------------------------------------------------------------------------
-- 10b. Start a conversation with another user (avoids RLS chicken-and-egg)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.start_conversation(
  p_other_user_id uuid,
  p_context_type public.conversation_context_type DEFAULT 'general',
  p_context_id uuid DEFAULT NULL,
  p_context_label text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id uuid;
  v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_other_user_id IS NULL OR p_other_user_id = v_me THEN
    RAISE EXCEPTION 'Invalid other user';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_other_user_id) THEN
    RAISE EXCEPTION 'Other user not found';
  END IF;

  -- Reuse an existing 1:1 conversation with the same context (if any)
  SELECT c.id
  INTO v_conversation_id
  FROM public.conversations c
  WHERE c.context_type IS NOT DISTINCT FROM p_context_type
    AND c.context_id IS NOT DISTINCT FROM p_context_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = c.id AND cp.user_id = v_me
    )
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = c.id AND cp.user_id = p_other_user_id
    )
    AND (
      SELECT count(*) FROM public.conversation_participants cp
      WHERE cp.conversation_id = c.id
    ) = 2
  ORDER BY c.updated_at DESC
  LIMIT 1;

  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  INSERT INTO public.conversations (context_type, context_id, context_label)
  VALUES (p_context_type, p_context_id, p_context_label)
  RETURNING id INTO v_conversation_id;

  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES
    (v_conversation_id, v_me),
    (v_conversation_id, p_other_user_id);

  RETURN v_conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_conversation(
  uuid,
  public.conversation_context_type,
  uuid,
  text
) TO authenticated;

-- ---------------------------------------------------------------------------
-- 11. Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_items ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- events
CREATE POLICY "events_select_authenticated"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "events_insert_own"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "events_update_own"
  ON public.events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "events_delete_own"
  ON public.events FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- event_attendees
CREATE POLICY "event_attendees_select_authenticated"
  ON public.event_attendees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "event_attendees_insert_own"
  ON public.event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "event_attendees_delete_own"
  ON public.event_attendees FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- housing_posts
CREATE POLICY "housing_posts_select_authenticated"
  ON public.housing_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "housing_posts_insert_own"
  ON public.housing_posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "housing_posts_update_own"
  ON public.housing_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "housing_posts_delete_own"
  ON public.housing_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- ride_requests
CREATE POLICY "ride_requests_select_authenticated"
  ON public.ride_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ride_requests_insert_own"
  ON public.ride_requests FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "ride_requests_update_own"
  ON public.ride_requests FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "ride_requests_delete_own"
  ON public.ride_requests FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- connections
CREATE POLICY "connections_select_participants"
  ON public.connections FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "connections_insert_as_requester"
  ON public.connections FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "connections_update_participants"
  ON public.connections FOR UPDATE
  TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid())
  WITH CHECK (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "connections_delete_participants"
  ON public.connections FOR DELETE
  TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- conversations
CREATE POLICY "conversations_select_participants"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(id));

CREATE POLICY "conversations_insert_authenticated"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "conversations_update_participants"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (public.is_conversation_participant(id))
  WITH CHECK (public.is_conversation_participant(id));

-- conversation_participants
CREATE POLICY "conversation_participants_select"
  ON public.conversation_participants FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_conversation_participant(conversation_id)
  );

CREATE POLICY "conversation_participants_insert"
  ON public.conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_conversation_participant(conversation_id)
  );

CREATE POLICY "conversation_participants_update_own"
  ON public.conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "conversation_participants_delete_own"
  ON public.conversation_participants FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- messages
CREATE POLICY "messages_select_participants"
  ON public.messages FOR SELECT
  TO authenticated
  USING (public.is_conversation_participant(conversation_id));

CREATE POLICY "messages_insert_as_sender_participant"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_participant(conversation_id)
  );

-- notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- feed_items (reads for authenticated users; writes via security definer triggers)
CREATE POLICY "feed_items_select_authenticated"
  ON public.feed_items FOR SELECT
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- 12. Realtime (run separately if needed — safe to re-run once)
-- ---------------------------------------------------------------------------
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_items;
