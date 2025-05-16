import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Award, ArrowUpRight, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { fetchUserData } from '../services/userService';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user) {
          const data = await fetchUserData(user.id);
          setUserData(data);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [user]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  if (isLoading) {
    return <div className="animate-pulse p-4">Loading profile data...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage your account details and environmental impact.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div 
          className="card md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex items-start">
              <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <User className="h-8 w-8" />
              </div>
              
              <div className="ml-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{userData?.username || user?.email?.split('@')[0]}</h2>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                
                <div className="mt-4 flex flex-wrap gap-4">
                  <div className="bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Level</p>
                    <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{userData?.level || 1}</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Carbon Saved</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{userData?.totalCarbonSaved || 0} kg</p>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Achievements</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{userData?.achievements || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="input"
                    value={userData?.username || user?.email?.split('@')[0] || ''}
                    readOnly
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    value={user?.email || ''}
                    readOnly
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    className="btn-outline text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Stats Card */}
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Impact</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Next level
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    75%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full" 
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  25 more kg CO2 to reach Level {(userData?.level || 1) + 1}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Environment Impact</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Trees equivalent</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.floor((userData?.totalCarbonSaved || 0) / 20)} trees
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Car miles avoided</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.floor((userData?.totalCarbonSaved || 0) * 2.5)} miles
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Home energy for</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Math.floor((userData?.totalCarbonSaved || 0) / 10)} days
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-primary-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Recent Achievements</span>
                  </div>
                  <button 
                    className="text-sm text-primary-600 dark:text-primary-400 flex items-center"
                    onClick={() => navigate('/achievements')}
                  >
                    View all
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
                
                <div className="mt-3 space-y-2">
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-2 rounded text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">Carbon Saver</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Save 10 kg of carbon emissions</p>
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-2 rounded text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">Eco Enthusiast</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Save 50 kg of carbon emissions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Preferences Section */}
      <motion.div 
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive updates and achievement notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Weekly Summary</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Get a weekly report of your carbon savings</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Daily Tips</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive daily eco-friendly suggestions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;