/**
 * Environment variable validation
 * Ensures all required environment variables are set before the application starts
 */

interface EnvironmentVariables {
  // Authentication
  JWT_SECRET: string;
  
  // Email
  SENDGRID_API_KEY?: string;
  SENDGRID_FROM_EMAIL?: string;
  
  // Cron
  CRON_SECRET?: string;
  
  // Application
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_JITSI_DOMAIN?: string;
  
  // Node environment
  NODE_ENV: 'development' | 'production' | 'test';
}

/**
 * Validates required environment variables
 * @throws Error if required variables are missing in production
 */
export function validateEnv(): EnvironmentVariables {
  const env = process.env as unknown as EnvironmentVariables;
  
  // Required in production
  if (env.NODE_ENV === 'production') {
    const required = ['JWT_SECRET'] as const;
    const missing = required.filter(key => !env[key]);
    
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missing.join(', ')}\n` +
        'Please set these variables in your .env file or deployment platform.'
      );
    }
    
    // Warn about recommended variables
    const recommended = [
      'SENDGRID_API_KEY',
      'CRON_SECRET',
      'NEXT_PUBLIC_APP_URL',
    ] as const;
    
    const missingRecommended = recommended.filter(key => !env[key]);
    if (missingRecommended.length > 0) {
      console.warn(
        `Warning: Recommended environment variables not set: ${missingRecommended.join(', ')}`
      );
    }
  }
  
  return env;
}

/**
 * Get validated environment variables
 * Call this at application startup to ensure all required variables are set
 */
export const env = validateEnv();
