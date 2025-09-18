/**
 * Date utility functions for consistent date formatting across the application
 */

/**
 * Format date to dd/mm/yyyy format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} - Formatted date in dd/mm/yyyy format
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format date to dd/mm/yyyy hh:mm format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} - Formatted date and time in dd/mm/yyyy hh:mm format
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return '';
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format date to dd/mm/yyyy hh:mm:ss format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} - Formatted date and time in dd/mm/yyyy hh:mm:ss format
 */
export const formatDateTimeFull = (dateInput) => {
  if (!dateInput) return '';
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Format date to relative time (e.g., "2 days ago", "1 hour ago")
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Format date to ISO string for API calls
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string} - ISO date string
 */
export const formatISO = (dateInput) => {
  if (!dateInput) return '';
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  
  return date.toISOString();
};

