const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const USERS_FILE = path.join(__dirname, 'users.json');

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Helper Functions for File-based DB ---
const getUsers = () => {
    try {
        // Create an empty users.json file if it doesn't exist
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, '[]');
        }
        const usersData = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(usersData);
    } catch (error) {
        console.error('Failed to read or parse users.json:', error);
        return [];
    }
};

const saveUsers = (users) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Failed to save to users.json:', error);
    }
};

// --- API ROUTES for Login and Registration ---

// @route   POST /api/register
// @desc    Register a new user
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;

    const users = getUsers();
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ msg: 'User already exists' });
    }

    try {
        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { email, password: hashedPassword };
        users.push(newUser);
        saveUsers(users);

        res.status(201).json({ msg: 'User registered successfully.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/login
// @desc    Authenticate user
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
        // Obfuscate login failure to prevent username enumeration attacks
        return res.status(400).json({ msg: 'Invalid credentials' });
    }

    try {
        // Compare submitted password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.json({ msg: 'Login successful' });
        } else {
            // Obfuscate login failure
            res.status(400).json({ msg: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Server error');
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));