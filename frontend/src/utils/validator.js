// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Name validation
export const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// Issue title validation
export const isValidTitle = (title) => {
  return title && title.trim().length >= 5 && title.trim().length <= 100;
};

// Issue description validation
export const isValidDescription = (description) => {
  return description && description.trim().length >= 10 && description.trim().length <= 1000;
};

// Location validation
export const isValidLocation = (location) => {
  return (
    location &&
    location.lat !== undefined &&
    location.lng !== undefined &&
    !isNaN(location.lat) &&
    !isNaN(location.lng) &&
    location.lat >= -90 &&
    location.lat <= 90 &&
    location.lng >= -180 &&
    location.lng <= 180
  );
};

// Tags validation
export const isValidTags = (tags) => {
  if (!Array.isArray(tags)) return false;
  if (tags.length === 0) return true; // Empty tags array is valid
  return tags.every((tag) => tag && tag.trim().length > 0 && tag.trim().length <= 50);
};

// File size validation (in bytes)
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// File type validation
export const isValidImageType = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

// Sanitize input (remove HTML tags)
export const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

// Validate and sanitize issue data
export const validateIssueData = (data) => {
  const errors = {};

  // Title validation
  if (!isValidTitle(data.title)) {
    errors.title = 'Title must be between 5 and 100 characters';
  }

  // Description validation
  if (!isValidDescription(data.description)) {
    errors.description = 'Description must be between 10 and 1000 characters';
  }

  // Location validation
  if (!isValidLocation(data.location)) {
    errors.location = 'Please select a valid location on the map';
  }

  // Severity validation
  const validSeverities = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(data.severity)) {
    errors.severity = 'Please select a valid severity level';
  }

  // Tags validation (optional)
  if (data.tags && data.tags.length > 0) {
    if (!isValidTags(data.tags)) {
      errors.tags = 'Invalid tags format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate comment data
export const validateCommentData = (text) => {
  const errors = {};

  if (!text || text.trim().length === 0) {
    errors.text = 'Comment cannot be empty';
  } else if (text.trim().length > 500) {
    errors.text = 'Comment must be less than 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate user registration data
export const validateRegistrationData = (data) => {
  const errors = {};

  if (!isValidName(data.name)) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate login data
export const validateLoginData = (data) => {
  const errors = {};

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password || data.password.length === 0) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidTitle,
  isValidDescription,
  isValidLocation,
  isValidTags,
  isValidFileSize,
  isValidImageType,
  sanitizeInput,
  validateIssueData,
  validateCommentData,
  validateRegistrationData,
  validateLoginData,
};