import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Trash2, Coffee, Zap, Trophy, ArrowUpRight } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { fetchUserData } from '../services/userService';
import EmissionsSummary from '../components/dashboard/EmissionsSummary';

const Dashboard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user) {
          const data = await fetchUserData(user.id);
          setUserData(data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const categories = [
    { name: 'Transport', path: '/transport', icon: <Car className="h-5 w-5" />, color: 'bg-blue-500' },
    { name: 'Waste', path: '/waste', icon: <Trash2 className="h-5 w-5" />, color: 'bg-amber-500' },
    { name: 'Diet', path: '/diet', icon: <Coffee className="h-5 w-5" />, color: 'bg-red-500' },
    { name: 'Energy', path: '/energy', icon: <Zap className="h-5 w-5" />, color: 'bg-purple-500' },
  ];

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading dashboard data...</div>;
  }

  const currentCarbon = userData?.totalCarbonSaved || 0;

  const totalCarbon = Object.values(userData?.stats?.carbonByCategory || {}).reduce((sum: any, val: any) => sum + val, 0);
  const categoryPercentages = categories.map(cat => ({
    ...cat,
    value: Math.round(((userData?.stats?.carbonByCategory?.[cat.name.toLowerCase()] || 0) / totalCarbon) * 100) || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Emissions Summary - full width */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <EmissionsSummary />
      </motion.div>

      {/* Carbon Savings + Emission Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carbon Savings */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Carbon Savings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Saved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {userData?.totalCarbonSaved.toFixed(1)} kg
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Trophy className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Emission Categories */}
        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Emission Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryPercentages.map((category) => (
              <motion.div
                key={category.name}
                className="card border overflow-hidden"
                whileHover={{
                  y: -5,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className={`${category.color} h-2`}></div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`${category.color} bg-opacity-10 p-2 rounded-lg mr-3`}>
                        <span
                          className={`text-${category.color.split('-')[1]}-600 dark:text-${category.color.split('-')[1]}-400`}
                        >
                          {category.icon}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{category.value}%</span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`${category.color} h-1.5 rounded-full`}
                        style={{ width: `${category.value}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      to={category.path}
                      className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center"
                    >
                      Add activity
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activities - full width */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activities</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Activity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Carbon Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {userData?.stats?.recentActivities?.map((activity: any) => (
                <tr key={activity.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {activity.activity_type}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${activity.category}-100 text-${activity.category}-800 dark:bg-${activity.category}-900 dark:text-${activity.category}-200`}>
                      {activity.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-green-600 dark:text-green-400">
                    {activity.carbon_impact.toFixed(2)} kg CO2
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Eco Tip - full width */}
      <motion.div
        className="card p-6 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Eco Tip of the Day</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Try to air dry your clothes instead of using a dryer. This can save up to 3 kg of CO2 emissions per load!
        </p>
      </motion.div>
    </div>
  );
};

export default Dashboard;
