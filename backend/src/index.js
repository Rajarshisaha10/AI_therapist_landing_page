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

// Google Auth Helpers
const getGoogleAuthUrl = (env, origin) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: `${origin}/api/auth/google/callback`,
    client_id: env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
};

// 2. Google Auth Initiation
app.get('/api/auth/google', (c) => {
  const origin = new URL(c.req.url).origin;
  return c.redirect(getGoogleAuthUrl(c.env, origin));
});

// 3. Google Auth Callback
app.get('/api/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.text('No code provided', 400);

  try {
    const origin = new URL(c.req.url).origin;
    // Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error('Failed to fetch token: ' + JSON.stringify(tokenData));

    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    if (!userRes.ok) throw new Error('Failed to fetch user');

    const email = userData.email;
    
    // DB logic
    const db = await getDb(c.env);
    await initDb(db);
    
    // Check if user exists
    const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let status = 'account';
    
    if (res.rows.length === 0) {
      await db.query(
        'INSERT INTO users (email, status) VALUES ($1, $2)',
        [email, 'account']
      );
    } else {
      status = res.rows[0].status;
    }
    await db.end();

    // Redirect to frontend dashboard
    return c.redirect(`https://rajarshisaha10.github.io/AI_therapist_landing_page/dashboard.html?email=${encodeURIComponent(email)}&status=${status}`);
  } catch (err) {
    return c.text('Auth error: ' + err.message, 500);
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

app.delete('/api/admin/feedback/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const db = await getDb(c.env)
    await initDb(db)

    await db.query('DELETE FROM feedback WHERE id = $1', [id])
    await db.end()
    
    return c.json({ ok: true, message: "Feedback deleted" })
  } catch (err) {
    return c.json({ ok: false, error: err.message }, 500)
  }
})

export default app
