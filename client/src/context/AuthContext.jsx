import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';
  
  // Set token in axios headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user on initial load
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Error loading user:', err.response?.data?.message || err.message);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('/auth/register', userData);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('/auth/login', userData);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Regenerate API key
  const regenerateApiKey = async () => {
    try {
      const res = await axios.post('/auth/regenerate-api-key');
      
      setUser({ ...user, apiKey: res.data.apiKey });
      return res.data.apiKey;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to regenerate API key');
      throw err;
    }
  };

  // Update webhook URL
  const updateWebhook = async (webhookUrl) => {
    try {
      const res = await axios.post('/auth/webhook', { webhookUrl });
      
      setUser({ ...user, webhookUrl: res.data.webhookUrl });
      return res.data.webhookUrl;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update webhook URL');
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    regenerateApiKey,
    updateWebhook,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
