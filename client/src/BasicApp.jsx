import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// Import our existing page components
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';

// Simple page components
const Home = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-blue-600 mb-4">Web Scraper Dashboard</h1>
    <p className="mb-6">Welcome to the Web Scraper as a Service application.</p>
    <div className="flex space-x-4">
      <Link to="/scrapers" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        View Scrapers
      </Link>
      <Link to="/profile" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
        Profile
      </Link>
    </div>
  </div>
);

const ScrapersList = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-blue-600 mb-4">Scrapers List</h1>
    <p className="mb-6">This page would normally display your scrapers.</p>
    <Link to="/" className="text-blue-500 hover:text-blue-700">
      Back to Home
    </Link>
  </div>
);

// Simple Auth Context
const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(true); // Set to true for testing
  
  const value = {
    isAuthenticated,
    setIsAuthenticated
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Layout Component
const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">Web Scraper</Link>
        <nav className="flex space-x-4">
          <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/scrapers" className="text-gray-600 hover:text-blue-600">Scrapers</Link>
          <Link to="/profile" className="text-gray-600 hover:text-blue-600">Profile</Link>
        </nav>
      </div>
    </header>
    <main className="max-w-7xl mx-auto px-4 py-6">
      {children}
    </main>
    <footer className="bg-white shadow mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-500">
        &copy; 2025 Web Scraper as a Service
      </div>
    </footer>
  </div>
);

function BasicApp() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          <Route path="/scrapers" element={
            <Layout>
              <ProtectedRoute>
                <ScrapersList />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Layout>
          } />
          <Route path="*" element={
            <Layout>
              <NotFound />
            </Layout>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default BasicApp;
