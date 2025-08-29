-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'club_admin', 'super_admin');
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
  club_id UUID REFERENCES public.clubs(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  venue TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time TEXT,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_fee TEXT,
  prize_pool TEXT,
  coordinator_contact TEXT,
  status event_status DEFAULT 'pending'::event_status,
  reminder_sent BOOLEAN DEFAULT false NOT NULL,
  capacity INTEGER,
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create bookmarks table
CREATE TABLE public.event_bookmarks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, event_id)
);

-- Create native event registrations table
CREATE TABLE public.event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, event_id)
);

-- Create event analytics table
CREATE TABLE public.event_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('view', 'click')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
CREATE POLICY "Super Admins can update events" ON public.events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Bookmarks RLS
ALTER TABLE public.event_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bookmarks" ON public.event_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Registrations RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own registrations" ON public.event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register themselves" ON public.event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Club admins can view registrations for their events" ON public.event_registrations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.clubs c ON e.club_id = c.id
    WHERE e.id = event_id AND c.admin_user_id = auth.uid()
  )
);

-- Analytics RLS
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert analytics" ON public.event_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Club admins can read analytics for their events" ON public.event_analytics FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.clubs c ON e.club_id = c.id
    WHERE e.id = event_id AND c.admin_user_id = auth.uid()
  )
);
CREATE POLICY "Super admins can read all analytics" ON public.event_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- Create storage bucket for event posters
INSERT INTO storage.buckets (id, name, public) VALUES ('event-posters', 'event-posters', true);

-- Storage RLS for event-posters
CREATE POLICY "Posters are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'event-posters');
CREATE POLICY "Authenticated users can upload posters" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'event-posters' AND auth.role() = 'authenticated'
);
