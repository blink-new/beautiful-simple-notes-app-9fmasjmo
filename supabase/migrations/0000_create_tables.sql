
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(name, user_id)
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES categories NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by owner." ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Categories are insertable by owner." ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Categories are updatable by owner." ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Categories are deletable by owner." ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY "Notes are viewable by owner." ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Notes are insertable by owner." ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Notes are updatable by owner." ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Notes are deletable by owner." ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions for realtime
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, updated_at)
  VALUES (new.id, new.email, '', now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for notes and categories
ALTER PUBLICATION supabase_realtime ADD TABLE notes;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;