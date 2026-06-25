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

// Helper to hash password using WebCrypto SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize Database Tables
async function initDb(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255),
      status VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255),
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

// 1. Waitlist Endpoint
app.post('/api/waitlist', async (c) => {
  try {
    const body = await c.req.json()
    const db = await getDb(c.env)
    await initDb(db)
    
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
    await initDb(db)
    
    // Hash the password
    const hashedPassword = await hashPassword(body.password)
    
    await db.query(
      'INSERT INTO users (email, password_hash, status) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, status = EXCLUDED.status',
      [body.email, hashedPassword, 'account']
    )
    
    await db.end()
    return c.json({ ok: true, message: "Account created" })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

// 3. Login Endpoint
app.post('/api/login', async (c) => {
  try {
    const body = await c.req.json()
    const db = await getDb(c.env)
    await initDb(db)
    
    const hashedPassword = await hashPassword(body.password)
    
    const res = await db.query('SELECT * FROM users WHERE email = $1 AND password_hash = $2', [body.email, hashedPassword])
    await db.end()
    
    if (res.rows.length === 0) {
      return c.json({ ok: false, error: "Invalid email or password" }, 401)
    }
    
    const user = res.rows[0]
    return c.json({ ok: true, status: user.status, email: user.email })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

// 4. Submit Feedback Endpoint
app.post('/api/feedback', async (c) => {
  try {
    const body = await c.req.json()
    const db = await getDb(c.env)
    await initDb(db)
    
    await db.query(
      'INSERT INTO feedback (email, message) VALUES ($1, $2)',
      [body.email || 'Anonymous', body.message]
    )
    
    await db.end()
    return c.json({ ok: true, message: "Feedback submitted" })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

// 5. Admin Endpoints
app.get('/api/admin/users', async (c) => {
  try {
    const db = await getDb(c.env)
    await initDb(db)

    const res = await db.query('SELECT id, email, status, created_at FROM users ORDER BY created_at DESC')
    await db.end()
    
    return c.json({ ok: true, users: res.rows })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

app.get('/api/admin/feedback', async (c) => {
  try {
    const db = await getDb(c.env)
    await initDb(db)

    const res = await db.query('SELECT id, email, message, created_at FROM feedback ORDER BY created_at DESC')
    await db.end()
    
    return c.json({ ok: true, feedback: res.rows })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

app.delete('/api/admin/users/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = await getDb(c.env)
    await initDb(db)

    await db.query('DELETE FROM users WHERE id = $1', [id])
    await db.end()
    
    return c.json({ ok: true, message: "User deleted" })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

export default app
