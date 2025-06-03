import { useState, useEffect } from 'react';
import { Upload, Loader2, Heart, AlertTriangle, Leaf, Droplets, Bug, Pill } from 'lucide-react';
import { analyzePlantImage } from '../lib/gemini';
import { useAuth } from '../contexts/AuthContext';
import { incrementUsage, getRemainingUsage, hasReachedLimit } from '../lib/usageTracker';
import { Link } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

type ResultTab = 'overview' | 'diagnosis' | 'treatment' | 'prevention';

interface HealthResult {
  overallHealth: string;
  issues: {
    diseases: string[];
    pests: string[];
    deficiencies: string[];
  };
  treatment: {
    immediate: string[];
    longTerm: string[];
    products: string[];
  };
  prevention: {
    care: string[];
    environment: string[];
    monitoring: string[];
  };
}

const PlantHealth = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>('overview');
  const [result, setResult] = useState<HealthResult | null>(null);
  const { currentUser } = useAuth();
  const [remainingUses, setRemainingUses] = useState(getRemainingUsage('health'));
  const [limitReached, setLimitReached] = useState(hasReachedLimit('health'));

  useEffect(() => {
    // If user is logged in, they have unlimited uses
    if (!currentUser) {
      setRemainingUses(getRemainingUsage('health'));
      setLimitReached(hasReachedLimit('health'));
    }
  }, [currentUser]);

  const parseHealthResult = (text: string): HealthResult => {
    // This is a simple parser. You might need to adjust it based on the actual AI response format
    const result: HealthResult = {
      overallHealth: '',
      issues: {
        diseases: [],
        pests: [],
        deficiencies: []
      },
      treatment: {
        immediate: [],
        longTerm: [],
        products: []
      },
      prevention: {
        care: [],
        environment: [],
        monitoring: []
      }
    };

    const lines = text.split('\n');
    let currentSection = '';

    for (const line of lines) {
      if (line.toLowerCase().includes('overall health:')) {
        result.overallHealth = line.split(':')[1].trim();
      } else if (line.toLowerCase().includes('diseases:')) {
        currentSection = 'diseases';
      } else if (line.toLowerCase().includes('pests:')) {
        currentSection = 'pests';
      } else if (line.toLowerCase().includes('deficiencies:')) {
        currentSection = 'deficiencies';
      } else if (line.trim() && currentSection) {
        switch (currentSection) {
          case 'diseases':
            result.issues.diseases.push(line.trim());
            break;
          case 'pests':
            result.issues.pests.push(line.trim());
            break;
          case 'deficiencies':
            result.issues.deficiencies.push(line.trim());
            break;
        }
      }
    }

    return result;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if limit reached for non-logged in users
    if (!currentUser && hasReachedLimit('health')) {
      setError('You have reached your free usage limit. Please sign up to continue.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setLoading(true);
      setError(null);
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const imageData = base64.split(',')[1];
      const response = await analyzePlantImage(imageData, 'health');
      const parsedResult = parseHealthResult(response);
      setResult(parsedResult);
      setActiveTab('overview');
      
      // Track usage if user is not logged in
      if (!currentUser) {
        incrementUsage('health');
        setRemainingUses(getRemainingUsage('health'));
        setLimitReached(hasReachedLimit('health'));
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('Failed to analyze the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: ResultTab; label: string; icon: JSX.Element }[] = [
    { id: 'overview', label: 'Overview', icon: <Heart className="w-5 h-5" /> },
    { id: 'diagnosis', label: 'Diagnosis', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'treatment', label: 'Treatment', icon: <Pill className="w-5 h-5" /> },
    { id: 'prevention', label: 'Prevention', icon: <Bug className="w-5 h-5" /> },
  ];

  const getHealthStatusColor = (status: string) => {
    const lowercaseStatus = status.toLowerCase();
    if (lowercaseStatus.includes('good') || lowercaseStatus.includes('healthy')) {
      return 'text-green-500';
    } else if (lowercaseStatus.includes('fair') || lowercaseStatus.includes('moderate')) {
      return 'text-yellow-500';
    } else {
      return 'text-red-500';
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Plant Health Check</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Upload a photo to diagnose your plant's health issues
          </p>
          {!currentUser && !limitReached && (
            <div className="mt-2 text-amber-600 bg-amber-50 inline-block px-3 py-1 rounded-full text-sm">
              Free uses remaining: {remainingUses}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            {!currentUser && limitReached ? (
              <div className="border-2 border-dashed border-amber-200 bg-amber-50/30 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="bg-amber-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2">
                    <FaLock className="text-3xl text-amber-500" />
                  </div>
                  <p className="text-gray-700 font-medium">
                    You've used all your free health checks
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Sign up to get unlimited access
                  </p>
                  <Link to="/register" className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 transition-all">
                    Sign Up
                  </Link>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                {image ? (
                  <div className="space-y-4">
                    <img
                      src={image}
                      alt="Uploaded plant"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setImage(null)}
                      className="px-4 py-2 text-sm text-red-500 hover:text-red-600"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Drag and drop your plant photo here, or click to select
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="health-upload"
                    />
                    <label
                      htmlFor="health-upload"
                      className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-lg cursor-pointer hover:bg-emerald-600 transition-all transform hover:scale-105"
                    >
                      Select Image
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
                  <p className="text-gray-500">Analyzing plant health...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-red-500 p-6">
                <p>{error}</p>
                {!currentUser && limitReached ? (
                  <Link to="/register" className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                    Sign Up
                  </Link>
                ) : (
                  <button
                    onClick={() => setError(null)}
                    className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            ) : result ? (
              <div>
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <div className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 focus:outline-none whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'border-b-2 border-emerald-500 text-emerald-500'
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-4">Overall Health Status</h3>
                        <p className={`text-xl ${getHealthStatusColor(result.overallHealth)}`}>
                          {result.overallHealth}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                            Diseases
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {result.issues.diseases.length} detected
                          </p>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
                            Pests
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {result.issues.pests.length} detected
                          </p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                            Deficiencies
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300">
                            {result.issues.deficiencies.length} detected
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'diagnosis' && (
                    <div className="space-y-8">
                      {result.issues.diseases.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-red-500">
                            Diseases Found
                          </h3>
                          <ul className="space-y-2">
                            {result.issues.diseases.map((disease, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                              >
                                <AlertTriangle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                                {disease}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.issues.pests.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-yellow-500">
                            Pest Issues
                          </h3>
                          <ul className="space-y-2">
                            {result.issues.pests.map((pest, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                              >
                                <Bug className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                                {pest}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.issues.deficiencies.length > 0 && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4 text-blue-500">
                            Nutrient Deficiencies
                          </h3>
                          <ul className="space-y-2">
                            {result.issues.deficiencies.map((deficiency, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                              >
                                <Droplets className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                                {deficiency}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'treatment' && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Immediate Actions</h3>
                        <ul className="space-y-2">
                          {result.treatment.immediate.map((action, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                            >
                              <Pill className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Long-term Treatment</h3>
                        <ul className="space-y-2">
                          {result.treatment.longTerm.map((action, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                            >
                              <Leaf className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'prevention' && (
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Care Guidelines</h3>
                        <ul className="space-y-2">
                          {result.prevention.care.map((tip, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                            >
                              <Heart className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Environmental Factors</h3>
                        <ul className="space-y-2">
                          {result.prevention.environment.map((factor, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-gray-600 dark:text-gray-300"
                            >
                              <Droplets className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-500">
                <Heart className="w-16 h-16 mb-4 text-gray-400" />
                <p>Upload a plant photo to check its health</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantHealth; 