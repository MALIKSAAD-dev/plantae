import { Link } from 'react-router-dom';
import { Leaf, Search, Heart, MessageSquare } from 'lucide-react';

const Hero = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl font-bold leading-tight">
              Discover the World of Plants with{' '}
              <span className="text-emerald-500">Plantae</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your AI-powered companion for plant identification, health diagnosis, and expert care guidance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/identify"
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <Search className="w-5 h-5" />
                Identify Plants
              </Link>
              <Link
                to="/chat"
                className="flex items-center gap-2 px-6 py-3 border border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Ask the AI
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-3xl transform rotate-6"></div>
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Leaf className="w-8 h-8 text-emerald-500 mb-2" />
                  <h3 className="font-semibold">Plant Identification</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Identify any plant with AI
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Heart className="w-8 h-8 text-emerald-500 mb-2" />
                  <h3 className="font-semibold">Health Check</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Diagnose plant health issues
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <MessageSquare className="w-8 h-8 text-emerald-500 mb-2" />
                  <h3 className="font-semibold">AI Chatbot</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get expert plant care advice
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <Search className="w-8 h-8 text-emerald-500 mb-2" />
                  <h3 className="font-semibold">Plant Database</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Access comprehensive plant info
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 