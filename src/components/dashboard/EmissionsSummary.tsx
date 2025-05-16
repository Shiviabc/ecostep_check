import { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { motion } from 'framer-motion';
import { Car, Trash2, Coffee, Zap } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { fetchUserData } from '../../services/userService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EmissionsSummary = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const data = await fetchUserData(user.id);
        setUserData(data);
      } catch (error) {
        console.error('Error loading emissions data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const categoryIcons = {
    transport: <Car className="h-5 w-5" />,
    waste: <Trash2 className="h-5 w-5" />,
    diet: <Coffee className="h-5 w-5" />,
    energy: <Zap className="h-5 w-5" />,
  };

  const categoryColors = {
    transport: 'rgb(59, 130, 246)',
    waste: 'rgb(245, 158, 11)',
    diet: 'rgb(239, 68, 68)',
    energy: 'rgb(168, 85, 247)',
  };

  const pieChartData = {
    labels: Object.keys(userData?.stats?.carbonByCategory || {}),
    datasets: [
      {
        data: Object.values(userData?.stats?.carbonByCategory || {}),
        backgroundColor: Object.values(categoryColors),
        borderWidth: 0,
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
    },
    cutout: '65%',
    responsive: true,
    maintainAspectRatio: false,
  };

  const lineChartData = {
    labels: userData?.stats?.recentActivities?.map((activity: any) => 
      new Date(activity.created_at).toLocaleDateString()
    ).reverse() || [],
    datasets: [
      {
        label: 'Carbon Impact',
        data: userData?.stats?.recentActivities?.map((activity: any) => 
          activity.carbon_impact
        ).reverse() || [],
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 1)',
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: 'rgba(229, 231, 235, 1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          borderDash: [2, 4],
          color: 'rgba(156, 163, 175, 0.2)',
        },
      },
    },
  };

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading emissions data...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Carbon Impact by Category
        </h2>
        <div className="h-64">
          <Pie data={pieChartData} options={pieChartOptions} />
        </div>
      </motion.div>

      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Carbon Impact
        </h2>
        <div className="h-64">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </motion.div>

      <motion.div
        className="card p-6 md:col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Category Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(userData?.stats?.carbonByCategory || {}).map(([category, impact]: [string, any]) => (
            <div key={category} className="card border p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${category}-100 dark:bg-${category}-900/30`}>
                  {categoryIcons[category as keyof typeof categoryIcons]}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {category}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.abs(impact).toFixed(1)} kg
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default EmissionsSummary;