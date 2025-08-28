-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'club_admin', 'super_admin');
CREATE TYPE event_category AS ENUM ('technical', 'cultural', 'sports', 'hackathon', 'symposium');
CREATE TYPE event_status AS ENUM ('pending', 'approved', 'rejected');

-- Users table (Extends Supabase Auth)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'student'::user_role,
  department TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clubs table
CREATE TABLE public.clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instagram_handle TEXT,
  admin_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES public.clubs(id), -- Nullable initially if we allow users to post without a club yet
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category event_category NOT NULL,
  poster_url TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_link TEXT,
  status event_status DEFAULT 'pending'::event_status,
  capacity INTEGER,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS)

-- Users table RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Clubs table RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clubs are viewable by everyone" ON public.clubs FOR SELECT USING (true);

-- Events table RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved events are viewable by everyone" ON public.events FOR SELECT USING (status = 'approved');
CREATE POLICY "Club Admins can view their own pending events" ON public.events FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Club Admins can insert events" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create storage bucket for event posters
INSERT INTO storage.buckets (id, name, public) VALUES ('event-posters', 'event-posters', true);

-- Storage RLS for event-posters
CREATE POLICY "Posters are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'event-posters');
CREATE POLICY "Authenticated users can upload posters" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'event-posters' AND auth.role() = 'authenticated'
);
