import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHome, FaLeaf, FaHeartbeat, FaRobot, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <FaHome /> },
    { path: '/identification', label: 'Identification', icon: <FaLeaf /> },
    { path: '/health', label: 'Health', icon: <FaHeartbeat /> },
    { path: '/chat', label: 'Chat', icon: <FaRobot /> },
  ];

  // Check if the current page is the home page
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/40 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0 flex items-center">
                <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 h-9 w-9 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                  <FaLeaf className="text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 text-transparent bg-clip-text">Plantae</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-3">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-emerald-100 text-emerald-800 shadow-sm'
                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <span className={`mr-1.5 ${location.pathname === item.path ? 'text-emerald-600' : 'text-gray-400'}`}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Auth Links */}
            <div className="hidden md:flex md:items-center md:ml-6">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
                >
                  <span className="mr-1.5 bg-red-100 w-6 h-6 rounded-full flex items-center justify-center">
                    <FaSignOutAlt size={12} className="text-red-600" />
                  </span>
                  Logout
                </button>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out fixed top-16 left-0 right-0 z-[100] ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md shadow-lg rounded-b-xl mx-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg mx-2 ${
                location.pathname === item.path
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <span className={`mr-3 text-lg p-1.5 rounded-full ${
                location.pathname === item.path 
                  ? 'bg-emerald-200 text-emerald-600' 
                  : 'text-gray-400'
              }`}>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          {/* Mobile Auth Links */}
          {currentUser ? (
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg mx-2 text-gray-600 hover:bg-red-50 hover:text-red-600"
            >
              <span className="mr-3 text-lg p-1.5 rounded-full bg-red-100 text-red-500"><FaSignOutAlt /></span>
              Logout
            </button>
          ) : (
            <div className="flex flex-col space-y-2 mt-4 px-2">
              <Link
                to="/login"
                className="flex items-center px-4 py-2.5 text-base font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-2.5 text-base font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main content - Add top margin to account for fixed header */}
      <main className="flex-grow mt-16">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer - Only shown on the home page */}
      {isHomePage && (
        <footer className="bg-white border-t border-emerald-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-emerald-100 h-8 w-8 rounded-full flex items-center justify-center mr-2">
                  <FaLeaf className="text-emerald-600 text-sm" />
                </div>
                <span className="text-lg font-bold text-emerald-800">Plantae</span>
              </div>
              <p className="text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Plantae. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout; 