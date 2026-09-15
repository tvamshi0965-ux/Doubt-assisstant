import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const databaseUrl = [
  process.env.DATABASE_URL,
  process.env.POSTGRES_PRISMA_URL,
  process.env.POSTGRES_URL,
].find((value) => value && !value.includes('127.0.0.1') && !value.includes('localhost'))
  ?? process.env.DATABASE_URL
  ?? 'postgresql://localhost:5432/build-placeholder'

export const pool = new Pool({ connectionString: databaseUrl })
export const db = drizzle(pool)
