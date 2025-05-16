import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import supabase from '../lib/supabase';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  carbon_required: number;
  unlocked: boolean;
  unlocked_at?: string;
}

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // In a real app, this would fetch from the database
        // Here we're generating mock data
        
        // Get user's carbon saved
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('total_carbon_saved')
          .eq('id', user.id)
          .single();
          
        if (userError) {
          console.error('Error fetching user data:', userError);
          throw userError;
        }
        
        const carbonSaved = userData?.total_carbon_saved || 0;
        
        // Get all achievements and user's unlocked achievements
        const { data: allAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('carbon_required', { ascending: true });
          
        if (achievementsError) {
          console.error('Error fetching achievements:', achievementsError);
          throw achievementsError;
        }
        
        const { data: userAchievements, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', user.id);
          
        if (userAchievementsError) {
          console.error('Error fetching user achievements:', userAchievementsError);
          throw userAchievementsError;
        }
        
        // Map achievements with unlock status
        const userAchievementsMap = (userAchievements || []).reduce((acc: Record<string, string>, item: any) => {
          acc[item.achievement_id] = item.unlocked_at;
          return acc;
        }, {});
        
        const mappedAchievements = (allAchievements || []).map((achievement: any) => ({
          ...achievement,
          unlocked: userAchievementsMap.hasOwnProperty(achievement.id),
          unlocked_at: userAchievementsMap[achievement.id] || undefined,
        }));
        
        setAchievements(mappedAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        
        // Fallback to mock data if needed
        const mockAchievements = [
          {
            id: '1',
            name: 'First Steps',
            description: 'Track your first eco-friendly activity',
            icon: '🌱',
            carbon_required: 0,
            unlocked: true,
            unlocked_at: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Carbon Saver',
            description: 'Save 10 kg of carbon emissions',
            icon: '🌿',
            carbon_required: 10,
            unlocked: true,
            unlocked_at: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Eco Enthusiast',
            description: 'Save 50 kg of carbon emissions',
            icon: '🌲',
            carbon_required: 50,
            unlocked: true,
            unlocked_at: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Climate Champion',
            description: 'Save 100 kg of carbon emissions',
            icon: '🌳',
            carbon_required: 100,
            unlocked: true,
            unlocked_at: new Date().toISOString(),
          },
          {
            id: '5',
            name: 'Earth Guardian',
            description: 'Save 200 kg of carbon emissions',
            icon: '🌍',
            carbon_required: 200,
            unlocked: false,
          },
          {
            id: '6',
            name: 'Climate Warrior',
            description: 'Save 500 kg of carbon emissions',
            icon: '⚡',
            carbon_required: 500,
            unlocked: false,
          },
          {
            id: '7',
            name: 'Planetary Savior',
            description: 'Save 1000 kg of carbon emissions',
            icon: '🌠',
            carbon_required: 1000,
            unlocked: false,
          },
        ];
        
        setAchievements(mockAchievements);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAchievements();
  }, [user]);
  
  const calculateProgress = (achievement: Achievement) => {
    // Find the user's total carbon saved
    const totalSaved = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.carbon_required, 0);
    
    // Find the previous achievement's carbon requirement
    const previousAchievement = achievements
      .filter(a => a.carbon_required < achievement.carbon_required)
      .sort((a, b) => b.carbon_required - a.carbon_required)[0];
    
    const previousRequirement = previousAchievement ? previousAchievement.carbon_required : 0;
    
    // Calculate progress percentage for unlocked achievements
    if (achievement.unlocked) return 100;
    
    // Calculate progress percentage for the next achievement to unlock
    if (totalSaved < achievement.carbon_required) {
      const requiredRange = achievement.carbon_required - previousRequirement;
      const userProgress = totalSaved - previousRequirement;
      return Math.max(0, Math.min(99, Math.floor((userProgress / requiredRange) * 100)));
    }
    
    return 0;
  };
  
  if (isLoading) {
    return <div className="animate-pulse p-4">Loading achievements...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your progress and unlock rewards by reducing your carbon footprint.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            className={`card overflow-hidden ${achievement.unlocked ? 'border-primary-200 dark:border-primary-800' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            {/* Achievement Header */}
            <div className={`px-6 py-4 flex items-center space-x-4 ${
              achievement.unlocked 
                ? 'bg-primary-50 dark:bg-primary-900/30' 
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}>
              <div className={`p-3 rounded-full ${
                achievement.unlocked 
                  ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {achievement.unlocked ? (
                  <Trophy className="h-6 w-6" />
                ) : (
                  <Lock className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{achievement.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
              </div>
            </div>
            
            {/* Achievement Details */}
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {achievement.carbon_required} kg CO2 saved
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {calculateProgress(achievement)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`${
                    achievement.unlocked 
                      ? 'bg-primary-500' 
                      : 'bg-gray-400 dark:bg-gray-600'
                  } h-2.5 rounded-full`} 
                  style={{ width: `${calculateProgress(achievement)}%` }}
                ></div>
              </div>
              
              {achievement.unlocked ? (
                <div className="mt-4 text-sm text-green-600 dark:text-green-400 flex items-center">
                  <Trophy className="h-4 w-4 mr-1" />
                  <span>
                    Unlocked {new Date(achievement.unlocked_at!).toLocaleDateString()}
                  </span>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Save {achievement.carbon_required} kg of CO2 to unlock
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="card p-6 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Achievement Tips</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Looking to earn more achievements? Here are some ways to reduce your carbon footprint:
        </p>
        
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Choose cycling or walking for short trips instead of driving</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Reduce meat consumption by having plant-based meals several times a week</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Recycle and compost consistently to reduce landfill waste</span>
          </li>
          <li className="flex items-start">
            <span className="text-primary-500 mr-2">•</span>
            <span>Install energy-efficient appliances and LED lighting in your home</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Achievements;
