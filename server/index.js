import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'EcoStep API is running' });
});

// User related routes
app.get('/api/users/:userId/summary', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      throw profileError;
    }
    
    // Get user's activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (activitiesError) {
      throw activitiesError;
    }
    
    // Get user's achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', userId);
      
    if (achievementsError) {
      throw achievementsError;
    }
    
    // Calculate stats
    const totalActivities = activities.length;
    const carbonByCategory = activities.reduce((acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = 0;
      }
      acc[activity.category] += activity.carbon_impact;
      return acc;
    }, {});
    
    // Response with summary data
    res.status(200).json({
      profile,
      stats: {
        totalActivities,
        totalCarbonSaved: profile.total_carbon_saved,
        carbonByCategory,
        achievements: achievements.length,
      },
      recentActivities: activities.slice(0, 5),
      achievements: achievements.map(a => ({
        ...a.achievements,
        unlocked_at: a.unlocked_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching user summary:', error);
    res.status(500).json({ error: 'Failed to fetch user summary' });
  }
});

// Activities routes
app.post('/api/activities', async (req, res) => {
  try {
    const { userId, category, activityType, value, carbonImpact } = req.body;
    
    if (!userId || !category || !activityType || value === undefined || carbonImpact === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Insert activity
    const { data, error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        category,
        activity_type: activityType,
        value,
        carbon_impact: carbonImpact,
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    // Update user's total carbon saved if saving carbon (negative impact)
    if (carbonImpact < 0) {
      const carbonSaved = Math.abs(carbonImpact);
      
      const { error: updateError } = await supabase.rpc('increment', { 
        row_id: userId,
        column_name: 'total_carbon_saved',
        x: carbonSaved
      });
      
      if (updateError) {
        throw updateError;
      }
      
      // Check for new achievements
      await checkAchievements(userId);
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// Helper function to check and unlock achievements
async function checkAchievements(userId) {
  try {
    // Get user's total carbon saved
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('total_carbon_saved')
      .eq('id', userId)
      .single();
      
    if (userError) {
      throw userError;
    }
    
    // Get achievements the user hasn't unlocked yet that they now qualify for
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .lte('carbon_required', userData.total_carbon_saved)
      .not('id', 'in', supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)
      );
      
    if (achievementsError) {
      throw achievementsError;
    }
    
    // Unlock new achievements
    if (achievements && achievements.length > 0) {
      const newUserAchievements = achievements.map(achievement => ({
        user_id: userId,
        achievement_id: achievement.id,
      }));
      
      const { error: unlockError } = await supabase
        .from('user_achievements')
        .insert(newUserAchievements);
        
      if (unlockError) {
        throw unlockError;
      }
      
      // Update user level based on achievements
      if (achievements.length > 0) {
        const newLevel = Math.min(10, Math.floor(userData.total_carbon_saved / 100) + 1);
        
        const { error: levelError } = await supabase
          .from('profiles')
          .update({ level: newLevel })
          .eq('id', userId);
          
        if (levelError) {
          throw levelError;
        }
      }
    }
    
    return achievements || [];
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;