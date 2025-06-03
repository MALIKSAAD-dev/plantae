import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-6 h-6 text-emerald-500" />
              <span className="text-xl font-bold text-emerald-500">Plantae</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Your AI-powered companion for plant identification and care.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/identify" className="text-gray-600 dark:text-gray-300 hover:text-emerald-500">
                  Plant Identification
                </a>
              </li>
              <li>
                <a href="/health" className="text-gray-600 dark:text-gray-300 hover:text-emerald-500">
                  Health Diagnosis
                </a>
              </li>
              <li>
                <a href="/chat" className="text-gray-600 dark:text-gray-300 hover:text-emerald-500">
                  AI Chatbot
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-300">
                Email: support@plantae.app
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                Twitter: @plantae_app
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-300">
          <p>&copy; {new Date().getFullYear()} Plantae. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 