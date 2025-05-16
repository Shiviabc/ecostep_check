/*
  # Database Schema for EcoStep

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `username` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `total_carbon_saved` (numeric)
      - `level` (integer)
      - `created_at` (timestamp)
    - `activities`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `category` (text)
      - `activity_type` (text)
      - `value` (numeric)
      - `carbon_impact` (numeric)
      - `created_at` (timestamp)
    - `achievements`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `icon` (text)
      - `carbon_required` (numeric)
      - `created_at` (timestamp)
    - `user_achievements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `achievement_id` (uuid, foreign key)
      - `unlocked_at` (timestamp)
  2. Security
    - Enable RLS on all tables
    - Add policies for each table
      - Users can read/write their own data
      - Public can read achievements
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  total_carbon_saved numeric DEFAULT 0,
  level integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('transport', 'waste', 'diet', 'energy')),
  activity_type text NOT NULL,
  value numeric NOT NULL,
  carbon_impact numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  carbon_required numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Functions
CREATE OR REPLACE FUNCTION increment(
  row_id uuid,
  column_name text,
  x numeric
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_value numeric;
  new_value numeric;
BEGIN
  EXECUTE format('SELECT %I FROM profiles WHERE id = $1', column_name)
  INTO current_value
  USING row_id;
  
  new_value := current_value + x;
  
  EXECUTE format('UPDATE profiles SET %I = $1 WHERE id = $2', column_name)
  USING new_value, row_id;
  
  RETURN new_value;
END;
$$;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for activities
CREATE POLICY "Users can view their own activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Anyone can view achievements"
  ON achievements
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON user_achievements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements"
  ON user_achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, carbon_required)
VALUES
  ('First Steps', 'Track your first eco-friendly activity', '🌱', 0),
  ('Carbon Saver', 'Save 10 kg of carbon emissions', '🌿', 10),
  ('Eco Enthusiast', 'Save 50 kg of carbon emissions', '🌲', 50),
  ('Climate Champion', 'Save 100 kg of carbon emissions', '🌳', 100),
  ('Earth Guardian', 'Save 200 kg of carbon emissions', '🌍', 200),
  ('Climate Warrior', 'Save 500 kg of carbon emissions', '⚡', 500),
  ('Planetary Savior', 'Save 1000 kg of carbon emissions', '🌠', 1000)
ON CONFLICT DO NOTHING;