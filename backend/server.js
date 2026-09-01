require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Serve React build in production
const clientPath = path.join(__dirname, 'client');
const fs = require('fs');
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  // Any route that isn't /api/* serves React's index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
} else {
  // Health check (dev mode only)
  app.get('/', (req, res) => {
    res.json({ message: 'Student Notes API is running!' });
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
