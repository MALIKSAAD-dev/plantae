import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLeaf, FaSpinner, FaExclamationCircle, FaCheck, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { resetAllUsage } from '../lib/usageTracker';
import { migrateAnonymousChatsToFirestore } from '../lib/migrateChatData';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { register, signInWithGoogle, error, setError } = useAuth();
  const navigate = useNavigate();

  // Password strength indicators
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate inputs
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      await register(email, password);
      
      // After successful registration:
      
      // 1. Reset usage limits since user is now registered
      resetAllUsage();
      
      // 2. Migrate any anonymous chats to Firestore
      try {
        await migrateAnonymousChatsToFirestore();
      } catch (migrationError) {
        console.error('Failed to migrate chats, but registration succeeded:', migrationError);
      }
      
      // 3. Redirect to home page upon successful registration
      navigate('/');
    } catch (error) {
      // Error is handled in the auth context
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
      
      // Reset usage counters after successful login
      resetAllUsage();
      
      // Migrate any anonymous chats to Firestore
      try {
        await migrateAnonymousChatsToFirestore();
      } catch (migrationError) {
        console.error('Failed to migrate chats, but registration succeeded:', migrationError);
      }
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      // Error is handled in the auth context
      console.error('Google sign-up failed:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const getPasswordStrength = () => {
    let score = 0;
    if (hasMinLength) score++;
    if (hasUpperCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    
    if (score === 0) return { text: '', color: '' };
    if (score === 1) return { text: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { text: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { text: 'Good', color: 'bg-blue-500' };
    return { text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-3 rounded-full">
            <FaLeaf className="text-3xl text-emerald-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create your account
        </h1>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-center"
          >
            <FaExclamationCircle className="mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        <div className="mb-4">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-70"
          >
            {isGoogleLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Signing up with Google...
              </>
            ) : (
              <>
                <FaGoogle className="text-red-500 mr-2" />
                Sign up with Google
              </>
            )}
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="your@email.com"
              disabled={isLoading || isGoogleLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="********"
              disabled={isLoading || isGoogleLoading}
            />
            
            {password.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Password strength:</span>
                  <span className="text-xs font-medium">{passwordStrength.text}</span>
                </div>
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${passwordStrength.color}`} style={{ width: `${25 * getPasswordStrength().text.length}%` }}></div>
                </div>
                
                <ul className="mt-2 space-y-1">
                  <li className="text-xs flex items-center gap-1">
                    <span className={`inline-flex ${hasMinLength ? 'text-green-500' : 'text-gray-400'}`}>
                      {hasMinLength ? <FaCheck size={10} /> : '•'}
                    </span>
                    <span className={hasMinLength ? 'text-gray-700' : 'text-gray-400'}>At least 6 characters</span>
                  </li>
                  <li className="text-xs flex items-center gap-1">
                    <span className={`inline-flex ${hasUpperCase ? 'text-green-500' : 'text-gray-400'}`}>
                      {hasUpperCase ? <FaCheck size={10} /> : '•'}
                    </span>
                    <span className={hasUpperCase ? 'text-gray-700' : 'text-gray-400'}>Contains uppercase letter</span>
                  </li>
                  <li className="text-xs flex items-center gap-1">
                    <span className={`inline-flex ${hasNumber ? 'text-green-500' : 'text-gray-400'}`}>
                      {hasNumber ? <FaCheck size={10} /> : '•'}
                    </span>
                    <span className={hasNumber ? 'text-gray-700' : 'text-gray-400'}>Contains number</span>
                  </li>
                  <li className="text-xs flex items-center gap-1">
                    <span className={`inline-flex ${hasSpecialChar ? 'text-green-500' : 'text-gray-400'}`}>
                      {hasSpecialChar ? <FaCheck size={10} /> : '•'}
                    </span>
                    <span className={hasSpecialChar ? 'text-gray-700' : 'text-gray-400'}>Contains special character</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
              }`}
              placeholder="********"
              disabled={isLoading || isGoogleLoading}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading || (password !== confirmPassword) || !password || !email}
            className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register; 