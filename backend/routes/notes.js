import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// 1. Get all notes and study materials
router.get('/', (req, res) => {
  const { subject, category } = req.query;
  let notes = db.getCollection('notes');

  if (subject) {
    notes = notes.filter(n => n.subject.toLowerCase() === subject.toLowerCase());
  }
  if (category) {
    notes = notes.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }

  res.json(notes);
});

// 2. Get specific note detail
router.get('/:noteId', (req, res) => {
  const { noteId } = req.params;
  const note = db.findOne('notes', { id: noteId });
  if (note) {
    res.json(note);
  } else {
    res.status(404).json({ error: "Study note not found" });
  }
});

// 3. Create a student shared note
router.post('/', (req, res) => {
  const { title, subject, category, content, flashcards, videoUrl, userId } = req.body;

  if (!title || !subject || !content) {
    return res.status(400).json({ error: "Title, subject, and content are required." });
  }

  const newNote = {
    title,
    subject,
    category: category || "notes",
    content,
    flashcards: flashcards || [],
    videoUrl: videoUrl || "",
    userId: userId || "anonymous",
    date: new Date().toISOString()
  };

  const inserted = db.insert('notes', newNote);

  // Reward coins for contributing content!
  if (userId && userId !== "anonymous") {
    const user = db.findOne('users', { id: userId });
    if (user) {
      const currentCoins = (user.coins || 0) + 15; // +15 coins reward
      const badges = user.badges || [];
      if (!badges.includes("Knowledge Sharer")) {
        badges.push("Knowledge Sharer");
      }
      db.update('users', { id: userId }, { coins: currentCoins, badges });
    }
  }

  res.status(201).json(inserted);
});

export default router;
