import { format } from 'date-fns';

/**
 * Safely formats a date, handling invalid dates
 * @param {string|Date|null|undefined} dateInput - The date to format
 * @param {string} formatString - The format string for date-fns
 * @param {string} defaultValue - The fallback value if date is invalid
 * @returns {string} - The formatted date or fallback value
 */
export const safeFormatDate = (dateInput, formatString = 'dd MMM yyyy', defaultValue = 'N/A') => {
  if (!dateInput) return defaultValue;
  
  try {
    const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    
    // Check if date is valid
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return defaultValue;
    }
    
    return format(dateObj, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error, 'for input:', dateInput);
    return defaultValue;
  }
};

/**
 * Safely formats a date with time
 * @param {string|Date|null|undefined} dateInput - The date to format
 * @param {string} defaultValue - The fallback value if date is invalid
 * @returns {string} - The formatted date with time or fallback value
 */
export const safeFormatDateTime = (dateInput, defaultValue = 'N/A') => {
  return safeFormatDate(dateInput, 'dd MMM yyyy, hh:mm a', defaultValue);
};
