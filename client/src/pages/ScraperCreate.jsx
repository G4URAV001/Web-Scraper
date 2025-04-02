import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createScraper } from '../services/scraperService';

const ScraperCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    targetUrl: '',
    selectors: [{ name: '', selector: '', type: 'text', attribute: '' }],
    schedule: {
      active: false,
      frequency: 'once'
    },
    webhook: {
      active: false,
      url: ''
    },
    options: {
      waitForSelector: '',
      timeout: 30000,
      pagination: {
        enabled: false,
        nextSelector: '',
        maxPages: 1
      }
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: checked
          }
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked
        });
      }
    } else {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value
          }
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    }
  };

  const handleSelectorChange = (index, field, value) => {
    const updatedSelectors = [...formData.selectors];
    updatedSelectors[index] = {
      ...updatedSelectors[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      selectors: updatedSelectors
    });
  };

  const addSelector = () => {
    setFormData({
      ...formData,
      selectors: [
        ...formData.selectors,
        { name: '', selector: '', type: 'text', attribute: '' }
      ]
    });
  };

  const removeSelector = (index) => {
    const updatedSelectors = [...formData.selectors];
    updatedSelectors.splice(index, 1);
    
    setFormData({
      ...formData,
      selectors: updatedSelectors
    });
  };

  const handlePaginationChange = (field, value) => {
    setFormData({
      ...formData,
      options: {
        ...formData.options,
        pagination: {
          ...formData.options.pagination,
          [field]: value
        }
      }
    });
  };

  const handleOptionsChange = (field, value) => {
    setFormData({
      ...formData,
      options: {
        ...formData.options,
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!formData.name.trim()) {
        setError('Scraper name is required');
        setLoading(false);
        return;
      }
      
      if (!formData.targetUrl.trim()) {
        setError('Target URL is required');
        setLoading(false);
        return;
      }
      
      // Validate selectors
      const invalidSelectors = formData.selectors.filter(
        selector => !selector.name.trim() || !selector.selector.trim()
      );
      
      if (invalidSelectors.length > 0) {
        setError('All selectors must have a name and CSS selector');
        setLoading(false);
        return;
      }
      
      // Create scraper
      const response = await createScraper(formData);
      navigate(`/scrapers/${response.data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create scraper');
      console.error('Error creating scraper:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">Create New Scraper</h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Scraper Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="My Scraper"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700">
                    Target URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      name="targetUrl"
                      id="targetUrl"
                      value={formData.targetUrl}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Selectors</h3>
              <p className="mt-1 text-sm text-gray-500">
                Define what data you want to extract from the website.
              </p>

              <div className="mt-4 space-y-4">
                {formData.selectors.map((selector, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Selector {index + 1}</h4>
                      {formData.selectors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSelector(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            value={selector.name}
                            onChange={(e) => handleSelectorChange(index, 'name', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="title"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          CSS Selector
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            value={selector.selector}
                            onChange={(e) => handleSelectorChange(index, 'selector', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="h1.title"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <div className="mt-1">
                          <select
                            value={selector.type}
                            onChange={(e) => handleSelectorChange(index, 'type', e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="text">Text</option>
                            <option value="html">HTML</option>
                            <option value="attribute">Attribute</option>
                          </select>
                        </div>
                      </div>

                      {selector.type === 'attribute' && (
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Attribute Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              value={selector.attribute}
                              onChange={(e) => handleSelectorChange(index, 'attribute', e.target.value)}
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              placeholder="href"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSelector}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="-ml-0.5 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Selector
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Advanced Options</h3>
              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="waitForSelector" className="block text-sm font-medium text-gray-700">
                    Wait for Selector (optional)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="waitForSelector"
                      value={formData.options.waitForSelector}
                      onChange={(e) => handleOptionsChange('waitForSelector', e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="#content"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Wait for this element to appear before scraping
                  </p>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="timeout" className="block text-sm font-medium text-gray-700">
                    Timeout (ms)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="timeout"
                      value={formData.options.timeout}
                      onChange={(e) => handleOptionsChange('timeout', parseInt(e.target.value))}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      min="1000"
                      step="1000"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="pagination.enabled"
                        name="options.pagination.enabled"
                        type="checkbox"
                        checked={formData.options.pagination.enabled}
                        onChange={(e) => handlePaginationChange('enabled', e.target.checked)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="pagination.enabled" className="font-medium text-gray-700">
                        Enable Pagination
                      </label>
                      <p className="text-gray-500">
                        Scrape data from multiple pages
                      </p>
                    </div>
                  </div>
                </div>

                {formData.options.pagination.enabled && (
                  <>
                    <div className="sm:col-span-3">
                      <label htmlFor="nextSelector" className="block text-sm font-medium text-gray-700">
                        Next Page Selector
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="nextSelector"
                          value={formData.options.pagination.nextSelector}
                          onChange={(e) => handlePaginationChange('nextSelector', e.target.value)}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="a.next-page"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        CSS selector for the "Next" button
                      </p>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="maxPages" className="block text-sm font-medium text-gray-700">
                        Max Pages
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id="maxPages"
                          value={formData.options.pagination.maxPages}
                          onChange={(e) => handlePaginationChange('maxPages', parseInt(e.target.value))}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Webhook</h3>
              <div className="mt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="webhook.active"
                      name="webhook.active"
                      type="checkbox"
                      checked={formData.webhook.active}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="webhook.active" className="font-medium text-gray-700">
                      Enable Webhook
                    </label>
                    <p className="text-gray-500">
                      Send scraped data to your application via webhook
                    </p>
                  </div>
                </div>

                {formData.webhook.active && (
                  <div className="mt-4">
                    <label htmlFor="webhook.url" className="block text-sm font-medium text-gray-700">
                      Webhook URL
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        id="webhook.url"
                        name="webhook.url"
                        value={formData.webhook.url}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://your-app.com/webhook"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">Schedule</h3>
              <div className="mt-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="schedule.active"
                      name="schedule.active"
                      type="checkbox"
                      checked={formData.schedule.active}
                      onChange={handleChange}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="schedule.active" className="font-medium text-gray-700">
                      Enable Scheduling
                    </label>
                    <p className="text-gray-500">
                      Run this scraper automatically on a schedule
                    </p>
                  </div>
                </div>

                {formData.schedule.active && (
                  <div className="mt-4">
                    <label htmlFor="schedule.frequency" className="block text-sm font-medium text-gray-700">
                      Frequency
                    </label>
                    <div className="mt-1">
                      <select
                        id="schedule.frequency"
                        name="schedule.frequency"
                        value={formData.schedule.frequency}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="once">Once</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/scrapers')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Scraper'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScraperCreate;
