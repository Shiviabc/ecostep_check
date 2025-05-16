/*
  # Fix carbon savings functionality

  1. Changes
    - Add trigger to update total_carbon_saved
    - Add function to calculate and update user level
    - Fix profiles table constraints

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for carbon calculations
*/

-- Create function to update total carbon saved
CREATE OR REPLACE FUNCTION update_total_carbon_saved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.carbon_impact < 0 THEN
    UPDATE profiles
    SET total_carbon_saved = total_carbon_saved + ABS(NEW.carbon_impact)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for activities table
DROP TRIGGER IF EXISTS update_carbon_saved_trigger ON activities;
CREATE TRIGGER update_carbon_saved_trigger
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_total_carbon_saved();

-- Create function to update user level
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := LEAST(10, FLOOR(NEW.total_carbon_saved / 100) + 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS update_level_trigger ON profiles;
CREATE TRIGGER update_level_trigger
  BEFORE UPDATE OF total_carbon_saved ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- Ensure profiles table has proper defaults
ALTER TABLE profiles
  ALTER COLUMN total_carbon_saved SET DEFAULT 0,
  ALTER COLUMN level SET DEFAULT 1;

-- Add check constraints
ALTER TABLE profiles
  ADD CONSTRAINT total_carbon_saved_non_negative CHECK (total_carbon_saved >= 0),
  ADD CONSTRAINT level_range CHECK (level BETWEEN 1 AND 10);