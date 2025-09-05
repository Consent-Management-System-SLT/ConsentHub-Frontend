/**
 * Secure Logger Utility
 * Sanitizes sensitive data from logs in production
 */

// Check if we're in production mode
const isProduction = import.meta.env.PROD;

/**
 * List of sensitive keys that should be masked
 */
const SENSITIVE_KEYS = [
  'password',
  'token',
  'jwt',
  'authorization',
  'secret',
  'key',
  'credentials',
  'auth',
  'bearer'
];

/**
 * Masks sensitive values in objects
 */
function maskSensitiveData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    // If the string looks like a JWT token or long credential, mask it
    if (data.length > 50 && (data.includes('eyJ') || data.includes('Bearer'))) {
      return '***MASKED_TOKEN***';
    }
    return data;
  }

  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => maskSensitiveData(item));
    }

    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
        lowerKey.includes(sensitiveKey)
      );

      if (isSensitive) {
        if (typeof value === 'string' && value.length > 0) {
          // Show first 3 and last 3 characters for identification
          masked[key] = value.length > 10 
            ? `${value.substring(0, 3)}***${value.substring(value.length - 3)}`
            : '***MASKED***';
        } else {
          masked[key] = '***MASKED***';
        }
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }

  return data;
}

/**
 * Safe console.log that masks sensitive data in production
 */
export const secureLog = {
  log: (...args: any[]) => {
    if (isProduction) {
      const sanitizedArgs = args.map(arg => maskSensitiveData(arg));
      console.log(...sanitizedArgs);
    } else {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (isProduction) {
      const sanitizedArgs = args.map(arg => maskSensitiveData(arg));
      console.error(...sanitizedArgs);
    } else {
      console.error(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isProduction) {
      const sanitizedArgs = args.map(arg => maskSensitiveData(arg));
      console.warn(...sanitizedArgs);
    } else {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isProduction) {
      const sanitizedArgs = args.map(arg => maskSensitiveData(arg));
      console.info(...sanitizedArgs);
    } else {
      console.info(...args);
    }
  }
};

/**
 * Safe logging for API requests - masks sensitive data
 */
export const logApiRequest = (method: string, endpoint: string, data?: any, headers?: any) => {
  secureLog.log(`Making ${method} request to: ${endpoint}`);
  if (data) {
    secureLog.log('Request data:', data);
  }
  if (headers) {
    secureLog.log('Request headers:', headers);
  }
};

/**
 * Safe logging for API responses - masks sensitive data
 */
export const logApiResponse = (response: any, label: string = 'Response') => {
  secureLog.log(`${label}:`, response);
};

/**
 * Safe logging for authentication operations
 */
export const logAuthOperation = (operation: string, email?: string, additionalData?: any) => {
  if (email) {
    // In production, show only domain part of email
    const maskedEmail = isProduction 
      ? email.includes('@') 
        ? `***@${email.split('@')[1]}` 
        : '***MASKED***'
      : email;
    
    secureLog.log(`${operation}:`, maskedEmail);
  } else {
    secureLog.log(operation);
  }
  
  if (additionalData) {
    secureLog.log('Additional data:', additionalData);
  }
};
