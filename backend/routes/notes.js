const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { readJSON, writeJSON } = require('../utils/fileHelpers');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const NOTES_FILE = path.join(__dirname, '..', 'data', 'notes.json');

// All routes are protected
router.use(authMiddleware);

// ─── Get all notes for the logged-in user ──────────────
router.get('/', (req, res) => {
  try {
    const notes = readJSON(NOTES_FILE);
    const userNotes = notes.filter(note => note.userId === req.user.id);
    res.json(userNotes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes.' });
  }
});

// ─── Create a new note ─────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { title, subject, content } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ message: 'Title, subject, and content are required.' });
    }

    const notes = readJSON(NOTES_FILE);

    const newNote = {
      id: uuidv4(),
      userId: req.user.id,
      title,
      subject,
      content,
      createdAt: new Date().toISOString(),
    };

    notes.push(newNote);
    writeJSON(NOTES_FILE, notes);

    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ message: 'Error creating note.' });
  }
});

// ─── Update a note ─────────────────────────────────────
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, content } = req.body;

    const notes = readJSON(NOTES_FILE);
    const noteIndex = notes.findIndex(n => n.id === id && n.userId === req.user.id);

    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found or access denied.' });
    }

    // Update fields if provided
    if (title) notes[noteIndex].title = title;
    if (subject) notes[noteIndex].subject = subject;
    if (content) notes[noteIndex].content = content;

    writeJSON(NOTES_FILE, notes);

    res.json(notes[noteIndex]);
  } catch (err) {
    res.status(500).json({ message: 'Error updating note.' });
  }
});

// ─── Delete a note ─────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const notes = readJSON(NOTES_FILE);
    const noteIndex = notes.findIndex(n => n.id === id && n.userId === req.user.id);

    if (noteIndex === -1) {
      return res.status(404).json({ message: 'Note not found or access denied.' });
    }

    notes.splice(noteIndex, 1);
    writeJSON(NOTES_FILE, notes);

    res.json({ message: 'Note deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting note.' });
  }
});

module.exports = router;
