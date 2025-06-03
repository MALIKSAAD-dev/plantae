import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FaLeaf, 
  FaHeartbeat, 
  FaRobot, 
  FaArrowRight, 
  FaCamera, 
  FaSearch, 
  FaClipboardCheck,
  FaSeedling,
  FaSun,
  FaWater,
  FaEnvelope,
  FaInstagram,
  FaGithub,
  FaCode,
  FaCopyright
} from 'react-icons/fa';

const features = [
  {
    title: 'Plant Identification',
    description: 'Upload an image to identify any plant species and learn about its characteristics, ecology, and uses.',
    icon: <FaLeaf />,
    path: '/identification',
    gradient: 'from-emerald-400 to-green-600',
  },
  {
    title: 'Health Analysis',
    description: 'Diagnose plant health issues, identify diseases and pests, and get treatment recommendations.',
    icon: <FaHeartbeat />,
    path: '/health',
    gradient: 'from-blue-400 to-emerald-600',
  },
  {
    title: 'Plant Chatbot',
    description: 'Ask questions about plant care, gardening tips, and get expert advice from our AI assistant.',
    icon: <FaRobot />,
    path: '/chat',
    gradient: 'from-purple-400 to-indigo-600',
  },
];

const socialLinks = [
  {
    name: 'Email',
    icon: <FaEnvelope />,
    url: 'mailto:memaliksaad17@gmail.com',
    username: 'memaliksaad17@gmail.com',
    color: 'bg-red-500 hover:bg-red-600'
  },
  {
    name: 'Instagram',
    icon: <FaInstagram />,
    url: 'https://instagram.com/iam.saaaaaad',
    username: 'call.me.malik_',
    color: 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600'
  },
  {
    name: 'GitHub',
    icon: <FaGithub />,
    url: 'https://github.com/MALIKSAAD-dev',
    username: 'MALIKSAAD-dev',
    color: 'bg-gray-800 hover:bg-gray-900'
  }
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Home = () => {
  const [, setScrollY] = useState(0);
  const [activeBenefit, setActiveBenefit] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  
  const heroHeadingPhrases = [
    "Plants with Plantae",
    "Any Plant with a Single Photo",
    "Your Plants with Expert AI Advice",
    "Plant Problems Instantly"
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBenefit(prev => (prev + 1) % 4);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % heroHeadingPhrases.length);
    }, 5500);
    
    return () => clearInterval(interval);
  }, [heroHeadingPhrases.length]);
  
  // We'll use the scrollY value for subtle animations
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 md:pt-20 pb-16 md:pb-24">
        {/* Background elements */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="absolute top-20 left-10 text-emerald-500 text-9xl"
            animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 6 }}
          >
            <FaLeaf />
          </motion.div>
          <motion.div 
            className="absolute bottom-20 right-20 text-emerald-600 text-8xl"
            animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 5, delay: 0.5 }}
          >
            <FaSeedling />
          </motion.div>
          <motion.div 
            className="absolute top-1/2 right-1/4 text-emerald-400 text-7xl"
            animate={{ y: [-15, 15, -15], rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 7, delay: 1 }}
          >
            <FaWater />
          </motion.div>
          <motion.div 
            className="absolute bottom-1/3 left-1/4 text-yellow-400 text-7xl"
            animate={{ y: [15, -15, 15], rotate: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 8, delay: 2 }}
          >
            <FaSun />
          </motion.div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              className="inline-block mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600 p-3 rounded-full shadow-lg">
                <FaLeaf className="text-white text-3xl" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-1 sm:mb-3"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Discover the World of
              </h1>
            </motion.div>
            
            <div className="h-[50px] sm:h-[60px] md:h-[70px] lg:h-[80px] flex items-center justify-center overflow-hidden mb-4 sm:mb-6">
              <AnimatePresence mode="wait">
                <motion.h1
                  key={phraseIndex}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 text-transparent bg-clip-text absolute"
                >
                  {heroHeadingPhrases[phraseIndex]}
                </motion.h1>
              </AnimatePresence>
            </div>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-3 sm:mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 px-2"
            >
              Identify, analyze, and understand your plants using state-of-the-art AI technology.
              Your personal botanist in your pocket.
            </motion.p>
            
            <motion.div 
              className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                to="/identification"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 md:text-lg md:px-10 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Started
                <FaArrowRight className="ml-2" />
              </Link>
              <Link
                to="/chat"
                className="w-full sm:w-auto sm:ml-4 inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 md:text-lg md:px-10 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                Try the Chat
              </Link>
            </motion.div>
            
            {/* Quick Camera Access Button */}
            <motion.div
              className="mt-4 sm:mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link
                to="/identification"
                className="inline-flex items-center justify-center px-4 py-3 rounded-full bg-white border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="mr-2 flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                  <FaCamera className="text-white text-lg" />
                </div>
                <span className="text-gray-800 font-medium">Quick Plant Scan</span>
              </Link>
            </motion.div>
          </div>
          
          {/* Plant statistics/benefits rotating section */}
          <motion.div 
            className="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl max-w-3xl mx-auto border border-emerald-100"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Transforming how you care for plants</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-green-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="mt-6 relative h-24">
              {[
                { icon: FaCamera, text: "Instantly identify over 10,000+ plant species from a single photo" },
                { icon: FaHeartbeat, text: "Diagnose plant diseases and get personalized treatment plans" },
                { icon: FaRobot, text: "24/7 AI assistant for all your plant care questions" },
                { icon: FaClipboardCheck, text: "Get detailed care instructions tailored to your specific environment" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="absolute inset-0 flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: activeBenefit === index ? 1 : 0,
                    x: activeBenefit === index ? 0 : 20,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-emerald-400 to-green-500 p-4 rounded-full text-white">
                    <item.icon className="text-xl" />
                  </div>
                  <p className="text-gray-700 font-medium text-lg">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
          </svg>
        </div>
      </section>

      {/* Features Section with 3D card effect */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 text-transparent bg-clip-text">
                Powerful Features
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to identify, understand, and care for your plants in one place.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                variants={fadeIn}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <div className={`h-2 bg-gradient-to-r ${feature.gradient}`}></div>
                <div className="p-8">
                  <div className={`bg-gradient-to-r ${feature.gradient} inline-block p-4 rounded-xl text-white mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 text-base">{feature.description}</p>
                  <Link
                    to={feature.path}
                    className="inline-flex items-center font-medium text-emerald-600 hover:text-emerald-700 transition-colors group"
                  >
                    Get Started 
                    <span className="ml-2 transform group-hover:translate-x-2 transition-transform duration-300">
                      <FaArrowRight />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - With animated steps */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              <span className="inline-block relative">
                How It Works
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"></div>
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to identify, analyze, and understand your plants
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/3 left-0 right-0 h-0.5 bg-emerald-200 z-0"></div>
            
            {/* Step 1 */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 h-full border border-emerald-100">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-emerald-700 mx-auto">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <div className="text-center">
                  <div className="inline-block bg-emerald-100 p-3 rounded-lg text-emerald-700 mb-4">
                    <FaCamera className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Upload an Image</h3>
                  <p className="text-gray-600">Take a clear photo of your plant and upload it to our platform for instant analysis.</p>
                </div>
              </div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 h-full border border-emerald-100">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-emerald-700 mx-auto">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <div className="text-center">
                  <div className="inline-block bg-emerald-100 p-3 rounded-lg text-emerald-700 mb-4">
                    <FaSearch className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">AI Analysis</h3>
                  <p className="text-gray-600">Our advanced AI identifies the plant species or analyzes health issues in seconds.</p>
                </div>
              </div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 h-full border border-emerald-100">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-emerald-700 mx-auto">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <div className="text-center">
                  <div className="inline-block bg-emerald-100 p-3 rounded-lg text-emerald-700 mb-4">
                    <FaClipboardCheck className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Get Results</h3>
                  <p className="text-gray-600">Receive detailed information, care instructions, and actionable recommendations.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact & Social Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 text-transparent bg-clip-text">
                Connect With Me
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions, suggestions or just want to chat? Reach out to me!
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {socialLinks.map((link, index) => (
              <motion.a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 ${link.color} text-white rounded-xl p-6 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
                variants={fadeIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-4xl mb-3">{link.icon}</span>
                <h3 className="font-bold text-lg mb-1">{link.name}</h3>
                <p className="text-white text-opacity-80 text-sm">{link.username}</p>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center mb-4">
              <FaCode className="text-emerald-600 mr-2" />
              <p className="text-gray-700 font-medium">
                Made with <span className="text-red-500">♥</span> by Malik Saad
              </p>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <FaCopyright className="mr-1" /> 2025 Plantae. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 