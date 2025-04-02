import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getScraper, updateScraper, runScraper, deleteScraper } from '../services/scraperService';

const ScraperDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scraper, setScraper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchScraper();
  }, [id]);

  const fetchScraper = async () => {
    try {
      setLoading(true);
      const response = await getScraper(id);
      setScraper(response.data);
      setEditForm(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load scraper details');
      console.error('Error fetching scraper:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(scraper);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setEditForm({
          ...editForm,
          [parent]: {
            ...editForm[parent],
            [child]: checked
          }
        });
      } else {
        setEditForm({
          ...editForm,
          [name]: checked
        });
      }
    } else {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setEditForm({
          ...editForm,
          [parent]: {
            ...editForm[parent],
            [child]: value
          }
        });
      } else {
        setEditForm({
          ...editForm,
          [name]: value
        });
      }
    }
  };

  const handleSelectorChange = (index, field, value) => {
    const updatedSelectors = [...editForm.selectors];
    updatedSelectors[index] = {
      ...updatedSelectors[index],
      [field]: value
    };
    
    setEditForm({
      ...editForm,
      selectors: updatedSelectors
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateScraper(id, editForm);
      fetchScraper();
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update scraper');
      console.error('Error updating scraper:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    try {
      setIsRunning(true);
      await runScraper(id);
      fetchScraper(); // Refresh to get updated lastRun time
    } catch (err) {
      setError('Failed to run scraper');
      console.error('Error running scraper:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this scraper? This action cannot be undone.')) {
      try {
        await deleteScraper(id);
        navigate('/scrapers');
      } catch (err) {
        setError('Failed to delete scraper');
        console.error('Error deleting scraper:', err);
      }
    }
  };

  if (loading && !scraper) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !scraper) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
        <button
          onClick={() => navigate('/scrapers')}
          className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
        >
          Back to Scrapers
        </button>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEditing ? 'Edit Scraper' : scraper?.name}
          </h1>
          {!isEditing && (
            <p className="mt-1 text-sm text-gray-500 truncate">{scraper?.targetUrl}</p>
          )}
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isRunning ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isRunning ? (
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
                    Running...
                  </>
                ) : (
                  <>
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Run Scraper
                  </>
                )}
              </button>
              <Link
                to={`/scrapers/${id}/data`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View Data
              </Link>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
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
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Scraper Details</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Details and configuration for this scraper.
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{scraper.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Target URL</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a href={scraper.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    {scraper.targetUrl}
                  </a>
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(scraper.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last Run</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {scraper.schedule?.lastRun ? new Date(scraper.schedule.lastRun).toLocaleString() : 'Never'}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Selectors</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {scraper.selectors.map((selector, index) => (
                      <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <span className="ml-2 flex-1 w-0 truncate">
                            <span className="font-medium">{selector.name}:</span> {selector.selector}
                            {selector.type === 'attribute' && ` (Attribute: ${selector.attribute})`}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Webhook</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {scraper.webhook?.active ? (
                    <div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Enabled
                      </span>
                      <p className="mt-1">{scraper.webhook.url}</p>
                    </div>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Disabled
                    </span>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Schedule</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {scraper.schedule?.active ? (
                    <div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Enabled
                      </span>
                      <p className="mt-1">Frequency: {scraper.schedule.frequency}</p>
                    </div>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Disabled
                    </span>
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Pagination</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {scraper.options?.pagination?.enabled ? (
                    <div>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Enabled
                      </span>
                      <p className="mt-1">Next Selector: {scraper.options.pagination.nextSelector}</p>
                      <p className="mt-1">Max Pages: {scraper.options.pagination.maxPages}</p>
                    </div>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Disabled
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <form>
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
                        value={editForm.name}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                        value={editForm.targetUrl}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900">Selectors</h3>
                <div className="mt-4 space-y-4">
                  {editForm.selectors.map((selector, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
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
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                        checked={editForm.webhook?.active}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="webhook.active" className="font-medium text-gray-700">
                        Enable Webhook
                      </label>
                    </div>
                  </div>

                  {editForm.webhook?.active && (
                    <div className="mt-4">
                      <label htmlFor="webhook.url" className="block text-sm font-medium text-gray-700">
                        Webhook URL
                      </label>
                      <div className="mt-1">
                        <input
                          type="url"
                          id="webhook.url"
                          name="webhook.url"
                          value={editForm.webhook?.url}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                        checked={editForm.schedule?.active}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="schedule.active" className="font-medium text-gray-700">
                        Enable Scheduling
                      </label>
                    </div>
                  </div>

                  {editForm.schedule?.active && (
                    <div className="mt-4">
                      <label htmlFor="schedule.frequency" className="block text-sm font-medium text-gray-700">
                        Frequency
                      </label>
                      <div className="mt-1">
                        <select
                          id="schedule.frequency"
                          name="schedule.frequency"
                          value={editForm.schedule?.frequency}
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
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ScraperDetail;
