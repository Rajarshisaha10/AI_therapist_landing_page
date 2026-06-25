import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Client } from 'pg'

const app = new Hono()

// Enable CORS for frontend requests
app.use('/*', cors())

app.get('/', (c) => c.text('Theraseek API is running!'))

// Helper to get DB client and connect
const getDb = async (env) => {
  const client = new Client({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  await client.connect()
  return client
}

// 1. Waitlist Endpoint
app.post('/api/waitlist', async (c) => {
  try {
    const body = await c.req.json()
    const db = await getDb(c.env)
    
    // Ensure table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // Insert or update to waitlist
    await db.query(
      'INSERT INTO users (email, status) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET status = EXCLUDED.status',
      [body.email, 'waitlist']
    )
    
    await db.end()
    return c.json({ ok: true, message: "Added to waitlist" })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

// 2. Signup Endpoint
app.post('/api/signup', async (c) => {
  try {
    const body = await c.req.json()
    const db = await getDb(c.env)
    
    // Ensure table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    
    // In a real app, hash the password using bcrypt. For this edge environment, we just store it.
    await db.query(
      'INSERT INTO users (email, password_hash, status) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, status = EXCLUDED.status',
      [body.email, body.password, 'account']
    )
    
    await db.end()
    return c.json({ ok: true, message: "Account created" })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

// 3. Admin Endpoint (returns all users)
app.get('/api/admin/users', async (c) => {
  try {
    const db = await getDb(c.env)
    
    // Ensure table exists just in case
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const res = await db.query('SELECT id, email, status, created_at FROM users ORDER BY created_at DESC')
    await db.end()
    
    return c.json({ ok: true, users: res.rows })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

export default app
