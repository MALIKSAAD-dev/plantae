import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasReachedLimit } from '../lib/usageTracker';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute = ({ redirectPath = '/login' }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  // Check what feature is being accessed based on the path
  const getFeatureFromPath = (): 'identification' | 'health' | 'chat' | null => {
    const path = location.pathname;
    if (path.includes('identification')) return 'identification';
    if (path.includes('health')) return 'health';
    if (path.includes('chat')) return 'chat';
    return null;
  };
  
  const feature = getFeatureFromPath();
  
  // If user is logged in, allow access to all routes
  if (currentUser) {
    return <Outlet />;
  }
  
  // If it's not a feature path or feature is null, require login
  if (!feature) {
    return <Navigate to={redirectPath} replace state={{ from: location }} />;
  }
  
  // Check if user has exceeded their free uses for this feature
  const reachedLimit = hasReachedLimit(feature);
  
  if (reachedLimit) {
    // Redirect to login with a message about limits and the return path
    return (
      <Navigate 
        to={redirectPath} 
        replace
        state={{ 
          from: location, 
          message: `You've used all your free ${feature} analysis. Sign up to continue.` 
        }}
      />
    );
  }
  
  // Allow access if user has free uses remaining
  return <Outlet />;
};

export default ProtectedRoute; 