import { neon } from '@neondatabase/serverless';

export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no está configurada. Configúrala en Vercel Environment Variables.');
  }
  return neon(connectionString);
}
