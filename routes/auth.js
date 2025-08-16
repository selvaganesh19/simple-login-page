const express = require('express');
const router = express.Router();

// Mock user data for demonstration purposes
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' }
];

// GET route for rendering the login page
router.get('/login', (req, res) => {
    res.sendFile('login.html', { root: './src/views' });
});

// POST route for handling login requests
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Successful login
        res.redirect('/dashboard');
    } else {
        // Failed login
        res.status(401).send('Invalid username or password');
    }
});

module.exports = router;