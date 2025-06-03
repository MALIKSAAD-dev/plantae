import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePlantImage } from '../lib/gemini';
import { FaCamera, FaSpinner, FaExclamationTriangle, FaHeartbeat, FaVirus, FaBug, FaFirstAid, FaShieldAlt, FaArrowLeft, FaInfoCircle, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { incrementUsage, getRemainingUsage, hasReachedLimit } from '../lib/usageTracker';
import { Link } from 'react-router-dom';

interface AnalysisResult {
  healthStatus: string[];
  diseases: string[];
  pests: string[];
  treatment: string[];
  prevention: string[];
}

type ResultTab = 'HEALTH STATUS' | 'DISEASES' | 'PESTS' | 'TREATMENT' | 'PREVENTION';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

const ResultCard = ({ title, icon, items }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
  >
    <div className="bg-emerald-50 p-4 flex items-center gap-3">
      <div className="bg-emerald-500 text-white rounded-full p-2">
        {icon}
      </div>
      <h3 className="font-bold text-emerald-800">{title}</h3>
    </div>
    <div className="p-4">
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const HealthAnalysis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { currentUser } = useAuth();
  const [remainingUses, setRemainingUses] = useState(getRemainingUsage('health'));
  const [limitReached, setLimitReached] = useState(hasReachedLimit('health'));

  useEffect(() => {
    if (!currentUser) {
      setRemainingUses(getRemainingUsage('health'));
      setLimitReached(hasReachedLimit('health'));
    }
  }, [currentUser]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const parseAnalysisResult = (text: string): AnalysisResult => {
    console.log("Raw health analysis response:", text);
    
    const result: AnalysisResult = {
      healthStatus: [],
      diseases: [],
      pests: [],
      treatment: [],
      prevention: []
    };

    // Split by sections using regex that matches both bold and non-bold headers
    const sections = text.split(/(?=\*\*HEALTH STATUS:\*\*|HEALTH STATUS:|(?:\*\*)?DISEASES:(?:\*\*)?|(?:\*\*)?PESTS:(?:\*\*)?|(?:\*\*)?TREATMENT:(?:\*\*)?|(?:\*\*)?PREVENTION:(?:\*\*)?)/);
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      // Remove any markdown formatting from the section title
      const sectionTitle = lines[0].trim().replace(/\*/g, '').trim();
      
      let currentSection: keyof AnalysisResult | null = null;
      
      switch (sectionTitle) {
        case 'HEALTH STATUS:':
          currentSection = 'healthStatus';
          break;
        case 'DISEASES:':
          currentSection = 'diseases';
          break;
        case 'PESTS:':
          currentSection = 'pests';
          break;
        case 'TREATMENT:':
          currentSection = 'treatment';
          break;
        case 'PREVENTION:':
          currentSection = 'prevention';
          break;
      }
      
      if (currentSection) {
        // Process all lines after the title
        lines.slice(1).forEach(line => {
          const trimmedLine = line.trim();
          // Match both asterisk and hyphen bullet points, and handle markdown formatting
          if (trimmedLine.match(/^[\*\-]\s+/)) {
            // Remove asterisks/stars used for markdown formatting and bullet points
            let content = trimmedLine
              .replace(/^[\*\-]\s+/, '') // Remove bullet point
              .replace(/\*\*/g, '')      // Remove bold markdown
              .replace(/\*/g, '')         // Remove italic markdown
              .trim();
              
            if (content && content !== 'Information not available.') {
              result[currentSection!].push(content);
            }
          }
        });
      }
    });

    // Ensure each section has at least one item
    Object.keys(result).forEach(key => {
      if (result[key as keyof AnalysisResult].length === 0) {
        result[key as keyof AnalysisResult].push('Information not available.');
      }
    });

    console.log('Final parsed health result:', result);
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

    setError(null);
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImage(base64);

        try {
          const analysisText = await analyzePlantImage(base64, 'health');
          const parsedResult = parseAnalysisResult(analysisText);
          setResult(parsedResult);
          
          if (!currentUser) {
            incrementUsage('health');
            setRemainingUses(getRemainingUsage('health'));
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to analyze image');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image');
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Check if limit reached for non-logged in users
    if (!currentUser && hasReachedLimit('health')) {
      setError('You have reached your free usage limit. Please sign up to continue.');
      return;
    }
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setImage(base64);
        setIsLoading(true);
        try {
          const analysisText = await analyzePlantImage(base64, 'health');
          const parsedResult = parseAnalysisResult(analysisText);
          setResult(parsedResult);
          
          if (!currentUser) {
            incrementUsage('health');
            setRemainingUses(getRemainingUsage('health'));
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to analyze image');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-800 mb-6 sm:mb-8 text-center">
          Plant Health Analysis
        </h1>

        {!currentUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-center"
          >
            <div className="flex justify-center items-center gap-2 mb-2">
              <FaInfoCircle className="text-amber-500" />
              <span className="font-medium text-amber-700">
                Free Usage
              </span>
            </div>
            <p className="text-amber-700 text-sm">
              You have <span className="font-bold">{remainingUses}</span> free health analyses remaining.
              {remainingUses === 0 
                ? " Sign up to continue using this feature." 
                : " Sign up for unlimited health analyses."}
            </p>
            {remainingUses === 0 && (
              <Link to="/login" className="mt-2 inline-block bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 transition-colors">
                Sign up or Login
              </Link>
            )}
          </motion.div>
        )}

        {result ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={resetAnalysis}
                className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                <FaArrowLeft className="mr-2" /> New Analysis
              </button>
              {image && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-emerald-500"
                >
                  <img src={image} alt="Analyzed plant" className="w-full h-full object-cover" />
                </motion.div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <ResultCard 
                title="Health Status" 
                icon={<FaHeartbeat />} 
                items={result.healthStatus} 
              />
              <ResultCard 
                title="Diseases" 
                icon={<FaVirus />} 
                items={result.diseases} 
              />
              <ResultCard 
                title="Pests" 
                icon={<FaBug />} 
                items={result.pests} 
              />
              <ResultCard 
                title="Treatment" 
                icon={<FaFirstAid />} 
                items={result.treatment} 
              />
            </div>
            <ResultCard 
              title="Prevention" 
              icon={<FaShieldAlt />} 
              items={result.prevention} 
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <motion.div
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6"
                whileHover={{ scale: !limitReached ? 1.01 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {!currentUser && limitReached ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center">
                    <div className="space-y-4">
                      <FaLock className="text-4xl sm:text-5xl text-amber-500 mx-auto" />
                      <p className="text-gray-600 font-medium">
                        You've used all your free health analyses
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Sign up or login to get unlimited access
                      </p>
                      <Link to="/login" className="inline-block bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                        Sign up or Login
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors ${
                      image ? 'border-emerald-500' : 'border-gray-300 hover:border-emerald-400'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    {image ? (
                      <motion.img
                        src={image}
                        alt="Uploaded plant"
                        className="max-h-64 sm:max-h-80 lg:max-h-96 mx-auto rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    ) : (
                      <div className="space-y-4">
                        <FaCamera className="text-4xl sm:text-5xl text-emerald-500 mx-auto" />
                        <p className="text-gray-600">
                          Click to upload or drag and drop an image
                        </p>
                        <p className="text-sm text-gray-500">
                          For best results, use a clear photo showing any problem areas
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {image && !isLoading && !error && !result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
                >
                  <h3 className="font-semibold text-lg mb-2 text-emerald-800">Tips for accurate diagnosis:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Focus on visible symptoms or damage</li>
                    <li>• Include both healthy and affected parts</li>
                    <li>• Capture different angles if possible</li>
                    <li>• Ensure good lighting to show true colors</li>
                  </ul>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FaSpinner className="text-4xl sm:text-5xl text-emerald-500 mb-4" />
                  </motion.div>
                  <p className="text-gray-700 text-lg sm:text-xl">Analyzing plant health...</p>
                  <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
                  <FaExclamationTriangle className="text-4xl sm:text-5xl text-red-500 mb-4" />
                  <p className="text-center text-red-600 mb-4">{error}</p>
                  {!limitReached && (
                    <button
                      onClick={() => setError(null)}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      Try Again
                    </button>
                  )}
                  {!currentUser && limitReached && (
                    <Link to="/login" className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                      Sign up or Login
                    </Link>
                  )}
                </div>
              ) : !image ? (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px]">
                  <FaHeartbeat className="text-4xl sm:text-5xl text-emerald-300 mb-4" />
                  <p className="text-center text-gray-600 text-lg sm:text-xl mb-2">
                    Diagnose Plant Health
                  </p>
                  <p className="text-center text-gray-500 max-w-md">
                    Upload a plant image to identify health issues, diseases, pests, and get treatment recommendations.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HealthAnalysis; 