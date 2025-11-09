import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle response errors globally
api.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx will trigger this function
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx will trigger this function
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.log('Unauthorized access - clearing token');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden
          console.error('Forbidden access:', error.response.data);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
          
        default:
          console.error('API error:', error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ==================== Authentication APIs ====================

export const authAPI = {
  /**
   * Login user with email and password
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with token and user data
   */
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  /**
   * Register new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise} Response with token and user data
   */
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  /**
   * Get current authenticated user
   * @returns {Promise} Response with user data
   */
  getCurrentUser: () => {
    return api.get('/auth/me');
  },

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise} Response with updated user
   */
  updateProfile: (userData) => {
    return api.put('/auth/profile', userData);
  },

  /**
   * Change password
   * @param {Object} passwords - { currentPassword, newPassword }
   * @returns {Promise} Response
   */
  changePassword: (passwords) => {
    return api.put('/auth/change-password', passwords);
  },
};

// ==================== Issues APIs ====================

export const issuesAPI = {
  /**
   * Get all issues with optional filters
   * @param {Object} params - Query parameters (filters, pagination)
   * @returns {Promise} Response with issues array
   */
  getAll: (params = {}) => {
    return api.get('/issues', { params });
  },

  /**
   * Get single issue by ID
   * @param {String} id - Issue ID
   * @returns {Promise} Response with issue data
   */
  getById: (id) => {
    return api.get(`/issues/${id}`);
  },

  /**
   * Create new issue
   * @param {Object} issueData - Issue data (title, description, location, etc.)
   * @returns {Promise} Response with created issue
   */
  create: (issueData) => {
    return api.post('/issues', issueData);
  },

  /**
   * Update existing issue
   * @param {String} id - Issue ID
   * @param {Object} issueData - Updated issue data
   * @returns {Promise} Response with updated issue
   */
  update: (id, issueData) => {
    return api.put(`/issues/${id}`, issueData);
  },

  /**
   * Delete issue
   * @param {String} id - Issue ID
   * @returns {Promise} Response
   */
  delete: (id) => {
    return api.delete(`/issues/${id}`);
  },

  /**
   * Upvote an issue
   * @param {String} id - Issue ID
   * @returns {Promise} Response with updated issue
   */
  upvote: (id) => {
    return api.post(`/issues/${id}/upvote`);
  },

  /**
   * Verify issue (admin only)
   * @param {String} id - Issue ID
   * @returns {Promise} Response with verified issue
   */
  verify: (id) => {
    return api.put(`/issues/${id}/verify`);
  },

  /**
   * Close issue (admin only)
   * @param {String} id - Issue ID
   * @param {String} reason - Reason for closing
   * @returns {Promise} Response with closed issue
   */
  close: (id, reason) => {
    return api.put(`/issues/${id}/close`, { reason });
  },

  /**
   * Export issues data
   * @param {String} format - Export format ('csv' or 'geojson')
   * @returns {Promise} Response with file blob
   */
  export: (format) => {
    return api.get(`/issues/export`, {
      params: { format },
      responseType: 'blob',
    });
  },

  /**
   * Get nearby issues
   * @param {Number} lat - Latitude
   * @param {Number} lng - Longitude
   * @param {Number} radius - Radius in km (default: 5)
   * @returns {Promise} Response with nearby issues
   */
  getNearby: (lat, lng, radius = 5) => {
    return api.get('/issues/nearby', {
      params: { lat, lng, radius },
    });
  },

  /**
   * Search issues by text
   * @param {String} query - Search query
   * @returns {Promise} Response with matching issues
   */
  search: (query) => {
    return api.get('/issues/search', {
      params: { q: query },
    });
  },
};

// ==================== Comments APIs ====================

export const commentsAPI = {
  /**
   * Get all comments for an issue
   * @param {String} issueId - Issue ID
   * @returns {Promise} Response with comments array
   */
  getByIssue: (issueId) => {
    return api.get(`/issues/${issueId}/comments`);
  },

  /**
   * Create new comment
   * @param {String} issueId - Issue ID
   * @param {Object} commentData - Comment data { text }
   * @returns {Promise} Response with created comment
   */
  create: (issueId, commentData) => {
    return api.post(`/issues/${issueId}/comments`, commentData);
  },

  /**
   * Update comment
   * @param {String} issueId - Issue ID
   * @param {String} commentId - Comment ID
   * @param {Object} commentData - Updated comment data
   * @returns {Promise} Response with updated comment
   */
  update: (issueId, commentId, commentData) => {
    return api.put(`/issues/${issueId}/comments/${commentId}`, commentData);
  },

  /**
   * Delete comment
   * @param {String} issueId - Issue ID
   * @param {String} commentId - Comment ID
   * @returns {Promise} Response
   */
  delete: (issueId, commentId) => {
    return api.delete(`/issues/${issueId}/comments/${commentId}`);
  },
};

// ==================== Upload APIs ====================

export const uploadAPI = {
  /**
   * Upload image file
   * @param {File} file - Image file to upload
   * @returns {Promise} Response with uploaded image URL
   */
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log('Upload progress:', percentCompleted + '%');
      },
    });
  },

  /**
   * Upload multiple images
   * @param {Array} files - Array of image files
   * @returns {Promise} Response with array of uploaded image URLs
   */
  uploadMultipleImages: async (files) => {
    const uploadPromises = files.map((file) => uploadAPI.uploadImage(file));
    const responses = await Promise.all(uploadPromises);
    return responses.map((response) => response.data.url);
  },

  /**
   * Delete uploaded image
   * @param {String} imageUrl - URL of image to delete
   * @returns {Promise} Response
   */
  deleteImage: (imageUrl) => {
    return api.delete('/upload', {
      data: { imageUrl },
    });
  },
};

// ==================== Statistics APIs ====================

export const statsAPI = {
  /**
   * Get general statistics
   * @returns {Promise} Response with stats data
   */
  getGeneral: () => {
    return api.get('/stats');
  },

  /**
   * Get user statistics
   * @param {String} userId - User ID
   * @returns {Promise} Response with user stats
   */
  getUserStats: (userId) => {
    return api.get(`/stats/user/${userId}`);
  },
};

// ==================== Notifications APIs ====================

export const notificationsAPI = {
  /**
   * Get user notifications
   * @returns {Promise} Response with notifications array
   */
  getAll: () => {
    return api.get('/notifications');
  },

  /**
   * Mark notification as read
   * @param {String} notificationId - Notification ID
   * @returns {Promise} Response
   */
  markAsRead: (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} Response
   */
  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  },

  /**
   * Delete notification
   * @param {String} notificationId - Notification ID
   * @returns {Promise} Response
   */
  delete: (notificationId) => {
    return api.delete(`/notifications/${notificationId}`);
  },
};

// Export the axios instance as default for custom requests
export default api;