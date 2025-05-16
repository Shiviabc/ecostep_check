const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
      <div className="container-app flex flex-col md:flex-row items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {currentYear} EcoStep. All rights reserved.
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-4">
          <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200">
            Terms of Service
          </a>
          <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;