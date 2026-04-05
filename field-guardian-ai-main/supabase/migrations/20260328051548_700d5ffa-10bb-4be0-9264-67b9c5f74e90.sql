
CREATE TABLE public.community_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  author_name text NOT NULL DEFAULT 'Anonymous Farmer',
  title text NOT NULL,
  content text NOT NULL,
  story_type text NOT NULL DEFAULT 'experience',
  region text,
  crop_type text,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stories" ON public.community_stories FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert stories" ON public.community_stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stories" ON public.community_stories FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stories" ON public.community_stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.story_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.story_likes FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can like" ON public.story_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.story_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.increment_story_likes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.community_stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_story_likes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.community_stories SET likes_count = likes_count - 1 WHERE id = OLD.story_id;
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_story_liked AFTER INSERT ON public.story_likes FOR EACH ROW EXECUTE FUNCTION public.increment_story_likes();
CREATE TRIGGER on_story_unliked AFTER DELETE ON public.story_likes FOR EACH ROW EXECUTE FUNCTION public.decrement_story_likes();
