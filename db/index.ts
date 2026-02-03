import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

export { db };