import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="text-center">
        <motion.div 
          className="flex space-x-2 mb-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-3 h-3 bg-primary-400 rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1] }}
          />
          <motion.div 
            className="w-3 h-3 bg-primary-500 rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1], delay: 0.1 }}
          />
          <motion.div 
            className="w-3 h-3 bg-primary-600 rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", times: [0, 0.5, 1], delay: 0.2 }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading</span>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;