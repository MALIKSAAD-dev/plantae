import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import PlantIdentification from './pages/PlantIdentification';
import HealthAnalysis from './pages/HealthAnalysis';
import PlantChatbot from './pages/PlantChatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Routes with Layout */}
        <Route element={<Layout><Home /></Layout>} path="/" />
        
        {/* Authentication Required Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout><PlantIdentification /></Layout>} path="/identification" />
          <Route element={<Layout><HealthAnalysis /></Layout>} path="/health" />
          <Route element={<Layout><PlantChatbot /></Layout>} path="/chat" />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;