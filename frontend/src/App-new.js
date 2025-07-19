import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ForumPage from './pages/ForumPage';
import ForumPostPage from './pages/ForumPostPage';
import MarketplacePage from './pages/MarketplacePage';
import MarketplaceItemPage from './pages/MarketplaceItemPage';
import SafetyPage from './pages/SafetyPage';
import SafetyReportPage from './pages/SafetyReportPage';
import ProfilePage from './pages/ProfilePage';
import NeighborsPage from './pages/NeighborsPage';
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={user ? <Layout><DashboardPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/forum" 
          element={user ? <Layout><ForumPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/forum/post/:id" 
          element={user ? <Layout><ForumPostPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/marketplace" 
          element={user ? <Layout><MarketplacePage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/marketplace/item/:id" 
          element={user ? <Layout><MarketplaceItemPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/safety" 
          element={user ? <Layout><SafetyPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/safety/report/:id" 
          element={user ? <Layout><SafetyReportPage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile" 
          element={user ? <Layout><ProfilePage /></Layout> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/neighbors" 
          element={user ? <Layout><NeighborsPage /></Layout> : <Navigate to="/login" replace />} 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
