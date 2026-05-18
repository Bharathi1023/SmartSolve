import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// ==========================================
// 1. DISCUSSION FORUM
// ==========================================

// Get all forum posts
router.get('/forum', (req, res) => {
  const posts = db.getCollection('forum').sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(posts);
});

// Create new forum post
router.post('/forum', (req, res) => {
  const { title, content, author, subject, userId } = req.body;

  if (!title || !content || !author) {
    return res.status(400).json({ error: "Title, content, and author are required." });
  }

  const newPost = {
    title,
    content,
    author,
    subject: subject || "General",
    date: new Date().toISOString(),
    replies: []
  };

  const inserted = db.insert('forum', newPost);

  // Reward coins for community participation
  if (userId) {
    const user = db.findOne('users', { id: userId });
    if (user) {
      db.update('users', { id: userId }, { coins: (user.coins || 0) + 10 });
    }
  }

  res.status(201).json(inserted);
});

// Reply to forum post
router.post('/forum/:postId/reply', (req, res) => {
  const { postId } = req.params;
  const { author, content, userId } = req.body;

  if (!author || !content) {
    return res.status(400).json({ error: "Author and content are required." });
  }

  const post = db.findOne('forum', { id: postId });
  if (!post) {
    return res.status(404).json({ error: "Forum post not found." });
  }

  const reply = {
    author,
    content,
    date: new Date().toISOString()
  };

  post.replies = post.replies || [];
  post.replies.push(reply);

  db.update('forum', { id: postId }, { replies: post.replies });

  // Reward coins for replying
  if (userId) {
    const user = db.findOne('users', { id: userId });
    if (user) {
      db.update('users', { id: userId }, { coins: (user.coins || 0) + 5 });
    }
  }

  res.status(201).json(post);
});

// ==========================================
// 2. GROUP STUDY ROOMS & LIVE CHAT
// ==========================================

// Get all study rooms
router.get('/rooms', (req, res) => {
  const rooms = db.getCollection('studyRooms');
  res.json(rooms);
});

// Send chat message in study room (with interactive classmate responses!)
router.post('/rooms/:roomId/chat', (req, res) => {
  const { roomId } = req.params;
  const { author, content } = req.body;

  if (!author || !content) {
    return res.status(400).json({ error: "Author and content are required." });
  }

  const room = db.findOne('studyRooms', { id: roomId });
  if (!room) {
    return res.status(404).json({ error: "Study room not found." });
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMessage = {
    author,
    content,
    time: timeStr
  };

  room.messages = room.messages || [];
  room.messages.push(newMessage);

  // Classmate interactive automatic responses based on user messages for a simulated real-time feeling!
  const classmateResponses = [
    {
      keywords: ["hi", "hello", "hey", "anyone here"],
      responses: [
        { author: "Sneha", content: "Hey! Welcome. Ready to crush some boards today?", time: timeStr },
        { author: "Rahul", content: "Hello! Yes, we're studying right now. Feel free to join in!", time: timeStr }
      ]
    },
    {
      keywords: ["quadratic", "math", "formula", "roots"],
      responses: [
        { author: "Aditya Hegde (99% CBSE)", content: "Math is so exciting! Let me know if you need help with factorization or discriminants, I just cleared the algebra mock test with 100%!", time: timeStr },
        { author: "Kiran", content: "Ah, the quadratic equation notes are super helpful. Check the formula sheet on the sidebar!", time: timeStr }
      ]
    },
    {
      keywords: ["pomodoro", "timer", "streak", "study time"],
      responses: [
        { author: "Sneha", content: "The 25-minute Pomodoro timer here keeps me so focused. Let's do a session together!", time: timeStr }
      ]
    },
    {
      keywords: ["exam", "stress", "scared", "nervous"],
      responses: [
        { author: "Anjali (Educator)", content: "Don't stress! Exam anxiety is very normal. Make sure to check our Exam Stress Management tips in the Study Materials section. Breathe in, breathe out! You got this.", time: timeStr }
      ]
    }
  ];

  let simulatedResponse = null;
  const lowercaseContent = content.toLowerCase();

  for (let match of classmateResponses) {
    if (match.keywords.some(k => lowercaseContent.includes(k))) {
      simulatedResponse = match.responses[Math.floor(Math.random() * match.responses.length)];
      break;
    }
  }

  // If no keyword match, 25% chance of a friendly cheer!
  if (!simulatedResponse && Math.random() < 0.3) {
    const defaultCheers = [
      { author: "Rahul", content: "Let's keep pushing! We have our mock tests coming up.", time: timeStr },
      { author: "Sneha", content: "Awesome study session. Let's keep the streak going!", time: timeStr },
      { author: "Aditya Hegde (99% CBSE)", content: "consistency is key! Let's get those top badges 🏅", time: timeStr }
    ];
    simulatedResponse = defaultCheers[Math.floor(Math.random() * defaultCheers.length)];
  }

  if (simulatedResponse) {
    room.messages.push(simulatedResponse);
  }

  // Limit room history to last 20 messages to keep DB tidy
  if (room.messages.length > 25) {
    room.messages = room.messages.slice(-20);
  }

  db.update('studyRooms', { id: roomId }, { messages: room.messages });
  
  res.status(201).json({
    updatedRoom: room,
    simulatedReply: simulatedResponse
  });
});

export default router;
