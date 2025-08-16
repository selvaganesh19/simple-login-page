const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Simple user database (in production, use a real database)
const users = [
  {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('password123', 10),
    email: 'admin@example.com'
  },
  {
    id: 2,
    username: 'user',
    password: bcrypt.hashSync('user123', 10),
    email: 'user@example.com'
  }
];

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/');
  }
};

// Routes
app.get('/', (req, res) => {
  // Don't redirect to dashboard immediately, let user see success page first
  if (req.session.user && !req.session.justLoggedIn) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  }
});

app.get('/login', (req, res) => {
  if (req.session.user && !req.session.justLoggedIn) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
  }
});

// Success page - make sure this shows after login
app.get('/success', requireAuth, (req, res) => {
  // Clear the justLoggedIn flag after showing success page
  req.session.justLoggedIn = false;
  res.sendFile(path.join(__dirname, 'views', 'success.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
  // Clear the justLoggedIn flag when accessing dashboard
  req.session.justLoggedIn = false;
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// API route to get user info
app.get('/api/user', requireAuth, (req, res) => {
  res.json({
    username: req.session.user.username,
    email: req.session.user.email,
    loginTime: req.session.user.loginTime
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.json({ success: false, message: 'Username and password are required' });
  }
  
  const user = users.find(u => u.username === username);
  
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      loginTime: new Date().toLocaleString()
    };
    // Set flag to show success page
    req.session.justLoggedIn = true;
    
    res.json({ 
      success: true, 
      message: 'Login successful! Redirecting...', 
      redirectUrl: '/success',
      user: {
        username: user.username,
        email: user.email
      }
    });
  } else {
    res.json({ success: false, message: 'Invalid username or password' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.json({ success: false, message: 'Error logging out' });
    } else {
      res.json({ success: true, message: 'Logged out successfully' });
    }
  });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1><a href="/">Go to Login</a>');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Demo credentials:`);
  console.log(`   Username: admin, Password: password123`);
  console.log(`   Username: user, Password: user123`);
});