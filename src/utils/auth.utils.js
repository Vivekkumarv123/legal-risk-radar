/**
 * Utility functions for handling authentication and token management
 */

/**
 * Get a valid access token, refreshing if necessary
 * @returns {Promise<string|null>} Access token or null if authentication fails
 */
export const getValidAccessToken = async () => {
  let accessToken = localStorage.getItem('accessToken');
  
  // If we have an access token, try to use it
  if (accessToken) {
    return accessToken;
  }
  
  // If no access token, try to refresh using the refresh token
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include' // Include cookies (refresh token)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
      }
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
  }
  
  return null;
};

/**
 * Make an authenticated fetch request with automatic token refresh
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = await getValidAccessToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // If we get a 401, try refreshing the token once
  if (response.status === 401) {
    // Remove the potentially expired token
    localStorage.removeItem('accessToken');
    
    // Try to get a fresh token
    const newToken = await getValidAccessToken();
    
    if (newToken) {
      // Retry the request with the new token
      const retryHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      };
      
      return fetch(url, {
        ...options,
        headers: retryHeaders
      });
    }
  }
  
  return response;
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export const isAuthenticated = async () => {
  const token = await getValidAccessToken();
  return token !== null;
};