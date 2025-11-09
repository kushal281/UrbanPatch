// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low - Minor inconvenience', color: '#3b82f6', emoji: '📍' },
  { value: 'medium', label: 'Medium - Needs attention', color: '#f59e0b', emoji: '⚠️' },
  { value: 'high', label: 'High - Safety concern', color: '#ef4444', emoji: '🚨' },
  { value: 'critical', label: 'Critical - Immediate danger', color: '#991b1b', emoji: '🔥' },
];

// Issue statuses
export const STATUS = {
  OPEN: 'open',
  VERIFIED: 'verified',
  CLOSED: 'closed',
};

export const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: '#3b82f6', emoji: '🔓' },
  { value: 'verified', label: 'Verified', color: '#10b981', emoji: '✅' },
  { value: 'closed', label: 'Closed', color: '#6b7280', emoji: '🔒' },
];

// User roles
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

// Common issue tags
export const COMMON_TAGS = [
  'pothole',
  'broken lamp',
  'park bench',
  'graffiti',
  'trash',
  'sidewalk',
  'traffic light',
  'drainage',
  'street sign',
  'playground',
  'road damage',
  'parking',
  'noise',
  'safety',
  'vandalism',
  'vegetation',
  'water leak',
  'public transport',
  'other',
];

// Sort options
export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'severity', label: 'Highest Severity' },
  { value: 'oldest', label: 'Oldest First' },
];

// Map settings
export const MAP_SETTINGS = {
  DEFAULT_CENTER: [20.2961, 85.8245], // Durg, Chhattisgarh
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// File upload settings
export const UPLOAD_SETTINGS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILES: 5,
};

// Form validation rules
export const VALIDATION_RULES = {
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
  },
  COMMENT: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 100,
  },
  TAG: {
    MAX_LENGTH: 50,
  },
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  ISSUES: {
    LIST: '/issues',
    CREATE: '/issues',
    GET: (id) => `/issues/${id}`,
    UPDATE: (id) => `/issues/${id}`,
    DELETE: (id) => `/issues/${id}`,
    UPVOTE: (id) => `/issues/${id}/upvote`,
    VERIFY: (id) => `/issues/${id}/verify`,
    CLOSE: (id) => `/issues/${id}/close`,
    EXPORT: '/issues/export',
  },
  COMMENTS: {
    LIST: (issueId) => `/issues/${issueId}/comments`,
    CREATE: (issueId) => `/issues/${issueId}/comments`,
    DELETE: (issueId, commentId) => `/issues/${issueId}/comments/${commentId}`,
  },
  UPLOAD: '/upload',
};

// Toast notification settings
export const TOAST_SETTINGS = {
  POSITION: 'top-right',
  AUTO_CLOSE: 3000,
  HIDE_PROGRESS_BAR: false,
  CLOSE_ON_CLICK: true,
  PAUSEON_HOVER: true,
  DRAGGABLE: true,
};

// Pagination settings
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  ITEMS_PER_PAGE_OPTIONS: [10, 20, 50, 100],
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  MAP_CENTER: 'map_center',
  MAP_ZOOM: 'map_zoom',
  FILTERS: 'filters',
};

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  ISSUE_CREATED: 'issue:created',
  ISSUE_UPDATED: 'issue:updated',
  ISSUE_DELETED: 'issue:deleted',
  ISSUE_UPVOTED: 'issue:upvoted',
  COMMENT_ADDED: 'comment:added',
  COMMENT_DELETED: 'comment:deleted',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UPLOAD_ERROR: 'Failed to upload file. Please try again.',
  LOCATION_ERROR: 'Failed to get your location. Please allow location access.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  ISSUE_CREATED: 'Issue reported successfully!',
  ISSUE_UPDATED: 'Issue updated successfully!',
  ISSUE_DELETED: 'Issue deleted successfully!',
  ISSUE_UPVOTED: 'Upvoted successfully!',
  COMMENT_ADDED: 'Comment added successfully!',
  COMMENT_DELETED: 'Comment deleted successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  FULL: 'EEEE, MMMM d, yyyy',
  TIME: 'h:mm a',
  DATETIME: 'MMM d, yyyy h:mm a',
};

// Color palette
export const COLORS = {
  PRIMARY: '#2563eb',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
  LIGHT: '#f8fafc',
  DARK: '#1e293b',
};

// Breakpoints (matching Bootstrap)
export const BREAKPOINTS = {
  XS: 0,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1400,
};

// App metadata
export const APP_INFO = {
  NAME: 'UrbanPatch',
  VERSION: '1.0.0',
  DESCRIPTION: 'Community-driven micro-improvement platform for neighborhoods',
  AUTHOR: 'UrbanPatch Team',
  SUPPORT_EMAIL: 'support@urbanpatch.com',
};

export default {
  SEVERITY_LEVELS,
  SEVERITY_OPTIONS,
  STATUS,
  STATUS_OPTIONS,
  USER_ROLES,
  COMMON_TAGS,
  SORT_OPTIONS,
  MAP_SETTINGS,
  UPLOAD_SETTINGS,
  VALIDATION_RULES,
  API_ENDPOINTS,
  TOAST_SETTINGS,
  PAGINATION,
  STORAGE_KEYS,
  SOCKET_EVENTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DATE_FORMATS,
  COLORS,
  BREAKPOINTS,
  APP_INFO,
};