import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Page Components
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ScraperList from './pages/ScraperList';
import ScraperCreate from './pages/ScraperCreate';
import ScraperDetail from './pages/ScraperDetail';
import ScraperData from './pages/ScraperData';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<MainLayout />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Main Layout with Sidebar and Navbar
function MainLayout() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/scrapers" element={
              <ProtectedRoute>
                <ScraperList />
              </ProtectedRoute>
            } />
            <Route path="/scrapers/create" element={
              <ProtectedRoute>
                <ScraperCreate />
              </ProtectedRoute>
            } />
            <Route path="/scrapers/:id" element={
              <ProtectedRoute>
                <ScraperDetail />
              </ProtectedRoute>
            } />
            <Route path="/scrapers/:id/data" element={
              <ProtectedRoute>
                <ScraperData />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
