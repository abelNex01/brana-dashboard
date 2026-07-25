/**
 * Environment variable validation using Zod schemas
 * Ensures all required environment variables are present and properly typed
 */

import { z } from 'zod';
import { logger } from '@/utils/logger';

const envSchema = z.object({
  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Supabase
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
});

type EnvSchema = z.infer<typeof envSchema>;

/**
 * Validates and returns environment variables
 * Throws an error if validation fails
 */
function validateEnv(): EnvSchema {
  try {
    const env = {
      PORT: import.meta.env.VITE_PORT || '3000',
      NODE_ENV: import.meta.env.MODE || 'development',
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    };
    
    const validatedEnv = envSchema.parse(env);
    logger.info('Environment variables validated successfully');
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => e.path.join('.')).join(', ');
      logger.error(`Environment validation failed: ${missingVars}`);
      throw new Error(`Missing or invalid environment variables: ${missingVars}`);
    }
    logger.error('Unexpected error during environment validation', error);
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Export type for use in other parts of the application
export type Env = EnvSchema;
