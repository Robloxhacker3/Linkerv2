const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['https://Robloxhacker3.github.io', 'http://localhost:3000'], // Replace with your GitHub Pages URL
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json());

// In-memory storage (use a database in production)
const pendingKeys = new Map();
const validKeys = new Map();
const usedKeys = new Set();

// Anti-bypass tracking
const userSessions = new Map();

// Generate random key
function generateKey() {
  return crypto.randomBytes(16).toString('hex');
}

// Generate session token
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Create pending key request
app.post('/api/create-session', (req, res) => {
  const { service } = req.body;
  const clientIP = req.ip;
  const userAgent = req.get('User-Agent');
  
  if (!service || !['linkvertise', 'lootlabs'].includes(service)) {
    return res.status(400).json({ error: 'Invalid service' });
  }

  const sessionToken = generateSessionToken();
  const timestamp = Date.now();
  
  // Store session data
  userSessions.set(sessionToken, {
    ip: clientIP,
    userAgent,
    service,
    timestamp,
    completed: false
  });

  // Clean up old sessions (older than 1 hour)
  for (const [token, session] of userSessions.entries()) {
    if (Date.now() - session.timestamp > 3600000) {
      userSessions.delete(token);
    }
  }

  res.json({ sessionToken, service });
});

// Verify completion and generate key
app.post('/api/verify-completion', (req, res) => {
  const { sessionToken } = req.body;
  const clientIP = req.ip;
  const userAgent = req.get('User-Agent');

  if (!sessionToken || !userSessions.has(sessionToken)) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  const session = userSessions.get(sessionToken);
  
  // Anti-bypass checks
  if (session.ip !== clientIP || session.userAgent !== userAgent) {
    return res.status(400).json({ error: 'Security check failed' });
  }

  if (session.completed) {
    return res.status(400).json({ error: 'Session already completed' });
  }

  // Check if enough time has passed (anti-bypass)
  const minTimeRequired = 10000; // 10 seconds minimum
  if (Date.now() - session.timestamp < minTimeRequired) {
    return res.status(400).json({ error: 'Please wait before completing' });
  }

  // Generate and store key
  const key = generateKey();
  const keyData = {
    key,
    timestamp: Date.now(),
    ip: clientIP,
    used: false
  };

  validKeys.set(key, keyData);
  session.completed = true;

  // Clean up session after 5 minutes
  setTimeout(() => {
    userSessions.delete(sessionToken);
  }, 300000);

  res.json({ key });
});

// Validate key for scripts
app.post('/api/validate-key', (req, res) => {
  const { key } = req.body;
  const clientIP = req.ip;

  if (!key || !validKeys.has(key)) {
    return res.status(400).json({ valid: false, error: 'Invalid key' });
  }

  const keyData = validKeys.get(key);
  
  // Check if key is already used
  if (usedKeys.has(key)) {
    return res.status(400).json({ valid: false, error: 'Key already used' });
  }

  // Check if key is expired (24 hours)
  const keyAge = Date.now() - keyData.timestamp;
  if (keyAge > 86400000) { // 24 hours in milliseconds
    validKeys.delete(key);
    return res.status(400).json({ valid: false, error: 'Key expired' });
  }

  // Mark key as used
  usedKeys.add(key);
  keyData.used = true;

  res.json({ 
    valid: true, 
    message: 'Key validated successfully',
    keyData: {
      timestamp: keyData.timestamp,
      age: keyAge
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: Date.now(),
    activeKeys: validKeys.size,
    activeSessions: userSessions.size
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Key system API running on port ${PORT}`);
});
