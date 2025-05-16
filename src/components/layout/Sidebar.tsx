import { NavLink, useLocation } from 'react-router-dom';
import { Home, Car, Trash2, Coffee, Zap, User, X } from 'lucide-react';
import { useEffect } from 'react';

interface SidebarProps {
  closeSidebar: () => void;
}

const Sidebar = ({ closeSidebar }: SidebarProps) => {
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Transport', path: '/transport', icon: <Car className="w-5 h-5" /> },
    { name: 'Waste', path: '/waste', icon: <Trash2 className="w-5 h-5" /> },
    { name: 'Diet', path: '/diet', icon: <Coffee className="w-5 h-5" /> },
    { name: 'Energy', path: '/energy', icon: <Zap className="w-5 h-5" /> },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <div className="flex items-center">
          <span className="text-primary-500 dark:text-primary-400 text-xl font-bold">Eco</span>
          <span className="text-gray-900 dark:text-white text-xl font-bold">Step</span>
        </div>
        <button
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          onClick={closeSidebar}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200
                ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <span className={`mr-3 ${isActive ? 'text-primary-500 dark:text-primary-400' : ''}`}>
                {item.icon}
              </span>
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-primary-50 dark:bg-primary-900/30 rounded-lg p-3">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-400">
            Tip of the day
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Try cycling to work instead of driving to reduce your carbon footprint!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
