import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyzePlantImage } from '../lib/gemini';
import { FaCamera, FaSpinner, FaExclamationTriangle, FaLeaf, FaMountain, FaSeedling, FaGem, FaArrowLeft, FaInfoCircle, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { incrementUsage, getRemainingUsage, hasReachedLimit } from '../lib/usageTracker';
import { Link } from 'react-router-dom';

interface AnalysisResult {
  overview: string[];
  characteristics: string[];
  ecology: string[];
  value: string[];
}

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
    className="bg-white rounded-xl shadow-md overflow-hidden border border-emerald-100 hover:shadow-lg transition-all"
  >
    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 flex items-center gap-3">
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full p-2.5 shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold text-emerald-800">{title}</h3>
    </div>
    <div className="p-5">
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-emerald-500 mt-1 bg-emerald-50 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">•</span>
            <span className="text-gray-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const PlantIdentification = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const [remainingUses, setRemainingUses] = useState(getRemainingUsage('identification'));
  const [limitReached, setLimitReached] = useState(hasReachedLimit('identification'));

  useEffect(() => {
    // If user is logged in, they have unlimited uses
    if (!currentUser) {
      setRemainingUses(getRemainingUsage('identification'));
      setLimitReached(hasReachedLimit('identification'));
    }
  }, [currentUser]);

  const parseAnalysisResult = (text: string): AnalysisResult => {
    console.log("Raw response:", text);
    
    const result: AnalysisResult = {
      overview: [],
      characteristics: [],
      ecology: [],
      value: []
    };

    // Split by sections using regex that matches both bold and non-bold headers
    const sections = text.split(/(?=\*\*OVERVIEW:\*\*|OVERVIEW:|(?:\*\*)?CHARACTERISTICS:(?:\*\*)?|(?:\*\*)?ECOLOGY:(?:\*\*)?|(?:\*\*)?VALUE:(?:\*\*)?)/);
    
    sections.forEach(section => {
      const lines = section.trim().split('\n');
      // Remove any markdown formatting from the section title
      const sectionTitle = lines[0].trim().replace(/\*/g, '').trim();
      
      let currentSection: keyof AnalysisResult | null = null;
      
      switch (sectionTitle) {
        case 'OVERVIEW:':
          currentSection = 'overview';
          break;
        case 'CHARACTERISTICS:':
          currentSection = 'characteristics';
          break;
        case 'ECOLOGY:':
          currentSection = 'ecology';
          break;
        case 'VALUE:':
          currentSection = 'value';
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
              
            if (content && content !== 'Information not available based on the image provided.') {
              result[currentSection!].push(content);
            }
          }
        });
      }
    });

    // Ensure each section has at least one item
    Object.keys(result).forEach(key => {
      if (result[key as keyof AnalysisResult].length === 0) {
        result[key as keyof AnalysisResult].push('Information not available based on the image provided.');
      }
    });

    console.log('Final parsed result:', result);
    return result;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if limit reached for non-logged in users
    if (!currentUser && hasReachedLimit('identification')) {
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
          const analysisText = await analyzePlantImage(base64, 'identification');
          const parsedResult = parseAnalysisResult(analysisText);
          setResult(parsedResult);
          
          // Track usage if user is not logged in
          if (!currentUser) {
            incrementUsage('identification');
            setRemainingUses(getRemainingUsage('identification'));
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
    if (!currentUser && hasReachedLimit('identification')) {
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
          const analysisText = await analyzePlantImage(base64, 'identification');
          const parsedResult = parseAnalysisResult(analysisText);
          setResult(parsedResult);
          
          // Track usage if user is not logged in
          if (!currentUser) {
            incrementUsage('identification');
            setRemainingUses(getRemainingUsage('identification'));
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10"
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-800 mb-6 sm:mb-8 text-center">
          <span className="inline-block bg-emerald-100 rounded-full p-2 mr-3 align-middle">
            <FaLeaf className="text-emerald-600 text-xl sm:text-2xl md:text-3xl" />
          </span>
          Plant Identification
        </h1>

        {!currentUser && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 rounded-lg p-5 mb-8 text-center shadow-sm"
          >
            <div className="flex justify-center items-center gap-2 mb-2">
              <div className="bg-amber-200 rounded-full p-1.5">
                <FaInfoCircle className="text-amber-700" />
              </div>
              <span className="font-medium text-amber-700">
                Free Usage
              </span>
            </div>
            <p className="text-amber-700 text-sm">
              You have <span className="font-bold">{remainingUses}</span> free identifications remaining.
              {remainingUses === 0 
                ? " Sign up to continue using this feature." 
                : " Sign up for unlimited identifications."}
            </p>
            {remainingUses === 0 && (
              <Link to="/login" className="mt-3 inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 transition-all">
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
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
              <button
                onClick={resetAnalysis}
                className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg font-medium"
              >
                <FaArrowLeft className="mr-2" /> New Analysis
              </button>
              {image && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-emerald-500 shadow-md"
                >
                  <img src={image} alt="Analyzed plant" className="w-full h-full object-cover" />
                </motion.div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <ResultCard 
                title="Overview" 
                icon={<FaLeaf size={16} />} 
                items={result.overview} 
              />
              <ResultCard 
                title="Characteristics" 
                icon={<FaSeedling size={16} />} 
                items={result.characteristics} 
              />
              <ResultCard 
                title="Ecology" 
                icon={<FaMountain size={16} />} 
                items={result.ecology} 
              />
              <ResultCard 
                title="Value" 
                icon={<FaGem size={16} />} 
                items={result.value} 
              />
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <motion.div
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 border border-emerald-100"
                whileHover={{ scale: !limitReached ? 1.01 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {!currentUser && limitReached ? (
                  <div className="border-2 border-dashed border-amber-200 bg-amber-50/30 rounded-lg p-6 sm:p-8 text-center">
                    <div className="space-y-4">
                      <div className="bg-amber-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2">
                        <FaLock className="text-3xl text-amber-500" />
                      </div>
                      <p className="text-gray-700 font-medium">
                        You've used all your free identifications
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
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all ${
                      image ? 'border-emerald-500 bg-emerald-50/30' : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/20'
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
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative"
                      >
                        <motion.img
                          src={image}
                          alt="Uploaded plant"
                          className="max-h-64 sm:max-h-80 lg:max-h-96 mx-auto rounded-lg shadow-md"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent rounded-lg"></div>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-emerald-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center">
                          <FaCamera className="text-2xl text-emerald-600" />
                        </div>
                        <p className="text-gray-700 font-medium">
                          Click to upload or drag and drop an image
                        </p>
                        <p className="text-sm text-gray-500">
                          For best results, use a clear photo of the plant
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
                  className="bg-white rounded-xl shadow-lg p-5 sm:p-6 border border-emerald-100"
                >
                  <h3 className="font-semibold text-lg mb-3 text-emerald-800 flex items-center">
                    <FaInfoCircle className="text-emerald-500 mr-2" /> Tips for best results:
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    {[
                      'Ensure good lighting for accurate colors',
                      'Include multiple parts of the plant if possible',
                      'Capture distinctive features like flowers or fruits',
                      'Avoid blurry or distant shots'
                    ].map((tip, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-emerald-500 mr-2 bg-emerald-50 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] border border-emerald-100">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-emerald-200 rounded-full opacity-30 animate-ping"></div>
                    <FaSpinner className="text-4xl sm:text-5xl text-emerald-500 mb-4 relative z-10" />
                  </motion.div>
                  <p className="text-emerald-800 text-lg sm:text-xl font-medium">Analyzing your plant...</p>
                  <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
                  <div className="w-full max-w-md h-2 bg-emerald-100 rounded-full mt-8 overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              ) : error ? (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] border border-red-100">
                  <div className="bg-red-100 rounded-full p-5 mb-6">
                    <FaExclamationTriangle className="text-3xl sm:text-4xl text-red-500" />
                  </div>
                  <p className="text-center text-red-600 mb-6 max-w-md">{error}</p>
                  {!limitReached && (
                    <button
                      onClick={() => setError(null)}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-lg hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium"
                    >
                      Try Again
                    </button>
                  )}
                  {!currentUser && limitReached && (
                    <Link to="/register" className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-lg hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 transition-all font-medium">
                      Sign Up
                    </Link>
                  )}
                </div>
              ) : !image ? (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] border border-emerald-100">
                  <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                    <FaLeaf className="text-3xl sm:text-4xl text-emerald-500" />
                  </div>
                  <p className="text-center text-emerald-800 text-xl sm:text-2xl font-bold mb-3">
                    Discover Your Plant
                  </p>
                  <p className="text-center text-gray-600 max-w-lg">
                    Upload a plant image to get detailed information about its characteristics, ecology, and uses. Our advanced AI will analyze your plant and provide you with comprehensive insights.
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-md">
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <div className="flex items-center font-medium text-emerald-800 mb-1">
                        <FaLeaf className="mr-2 text-emerald-500" /> Identification
                      </div>
                      <p className="text-xs text-gray-600">Discover the name and species of your plant</p>
                    </div>
                    <div className="bg-emerald-50 p-3 rounded-lg">
                      <div className="flex items-center font-medium text-emerald-800 mb-1">
                        <FaSeedling className="mr-2 text-emerald-500" /> Characteristics
                      </div>
                      <p className="text-xs text-gray-600">Learn about unique features and properties</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PlantIdentification; 