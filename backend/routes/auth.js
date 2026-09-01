const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileHelpers');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// ─── Signup ────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate all fields are present
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate phone is digits only
    if (!/^\d+$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must contain only digits.' });
    }

    // Check for existing user
    const users = readJSON(USERS_FILE);
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      phone,
      password: hashedPassword,
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    res.status(201).json({ message: 'Signup successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during signup.' });
  }
});

// ─── Login ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Sign JWT (expires in 2 hours)
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ─── Forgot Password ───────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phone, newPassword } = req.body;

    if (!email || !phone || !newPassword) {
      return res.status(400).json({ message: 'Email, phone, and new password are required.' });
    }

    const users = readJSON(USERS_FILE);
    const userIndex = users.findIndex(u => u.email === email && u.phone === phone);

    if (userIndex === -1) {
      return res.status(400).json({ message: 'No account found with that email and phone combination.' });
    }

    // Hash the new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;
    writeJSON(USERS_FILE, users);

    res.json({ message: 'Password reset successful! You can now log in with your new password.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during password reset.' });
  }
});

module.exports = router;
