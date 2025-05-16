/*
  # Set up achievements and fix data structure

  1. Changes
    - Add default achievements with proper icons and requirements
    - Add functions for achievement tracking
    - Add trigger for automatic achievement unlocking
*/

-- Create achievement tracking function
CREATE OR REPLACE FUNCTION check_and_award_achievements()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert achievements for users who qualify but haven't received them yet
  INSERT INTO user_achievements (user_id, achievement_id)
  SELECT 
    NEW.id as user_id,
    a.id as achievement_id
  FROM achievements a
  WHERE a.carbon_required <= NEW.total_carbon_saved
  AND NOT EXISTS (
    SELECT 1 
    FROM user_achievements ua 
    WHERE ua.user_id = NEW.id 
    AND ua.achievement_id = a.id
  );
  
  -- Update user level based on total carbon saved
  UPDATE profiles
  SET level = GREATEST(1, FLOOR(NEW.total_carbon_saved / 100) + 1)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for achievement tracking
DROP TRIGGER IF EXISTS check_achievements_trigger ON profiles;
CREATE TRIGGER check_achievements_trigger
  AFTER UPDATE OF total_carbon_saved
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_and_award_achievements();

-- Clear existing achievements and insert new ones
TRUNCATE TABLE achievements CASCADE;

INSERT INTO achievements (name, description, icon, carbon_required) VALUES
  ('First Steps', 'Begin your eco-friendly journey', '🌱', 0),
  ('Carbon Saver', 'Save 10 kg of carbon emissions', '🌿', 10),
  ('Eco Enthusiast', 'Save 50 kg of carbon emissions', '🌲', 50),
  ('Climate Champion', 'Save 100 kg of carbon emissions', '🌳', 100),
  ('Earth Guardian', 'Save 200 kg of carbon emissions', '🌍', 200),
  ('Climate Warrior', 'Save 500 kg of carbon emissions', '⚡', 500),
  ('Planetary Savior', 'Save 1000 kg of carbon emissions', '🌠', 1000),
  ('Transport Hero', 'Save 100 kg through eco-friendly transport', '🚲', 100),
  ('Waste Warrior', 'Save 50 kg through proper waste management', '♻️', 50),
  ('Diet Champion', 'Save 75 kg through sustainable diet choices', '🥗', 75),
  ('Energy Master', 'Save 150 kg through energy conservation', '💡', 150);