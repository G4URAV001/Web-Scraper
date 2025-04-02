import axios from 'axios';

// Get all scrapers
export const getScrapers = async () => {
  try {
    const res = await axios.get('/scrapers');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get a single scraper
export const getScraper = async (id) => {
  try {
    const res = await axios.get(`/scrapers/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create a new scraper
export const createScraper = async (scraperData) => {
  try {
    const res = await axios.post('/scrapers', scraperData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update a scraper
export const updateScraper = async (id, scraperData) => {
  try {
    const res = await axios.put(`/scrapers/${id}`, scraperData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete a scraper
export const deleteScraper = async (id) => {
  try {
    const res = await axios.delete(`/scrapers/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Run a scraper
export const runScraper = async (id) => {
  try {
    const res = await axios.post(`/scrapers/${id}/run`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get scraper data with pagination
export const getScraperData = async (id, page = 1, limit = 10) => {
  try {
    const res = await axios.get(`/scrapers/${id}/data?page=${page}&limit=${limit}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Export scraper data in specified format
export const exportScraperData = async (id, format = 'json') => {
  try {
    const res = await axios.get(`/scrapers/${id}/export?format=${format}`, {
      responseType: 'blob'
    });
    return res;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get visualization data for a scraper
export const getVisualizationData = async (id, type = 'summary') => {
  try {
    const res = await axios.get(`/scrapers/${id}/visualization?type=${type}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get scraper statistics
export const getScraperStats = async (id) => {
  try {
    const res = await axios.get(`/scrapers/${id}/stats`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user dashboard statistics
export const getDashboardStats = async () => {
  try {
    const res = await axios.get('/dashboard/stats');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Schedule a scraper
export const scheduleScraper = async (id, scheduleData) => {
  try {
    const res = await axios.post(`/scrapers/${id}/schedule`, scheduleData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Configure webhook for a scraper
export const configureWebhook = async (id, webhookData) => {
  try {
    const res = await axios.post(`/scrapers/${id}/webhook`, webhookData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Test webhook for a scraper
export const testWebhook = async (id) => {
  try {
    const res = await axios.post(`/scrapers/${id}/webhook/test`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
