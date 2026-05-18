import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Register new user
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const existingUser = db.findOne('users', { username });
  if (existingUser) {
    return res.status(400).json({ error: "Username already exists" });
  }

  const newUser = {
    username,
    password, // For simple MVP we use plain text, in real production we use bcrypt
    coins: 100,
    streak: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
    badges: ["Welcome Explorer"],
    preferences: {
      darkMode: true,
      language: "english",
      explainMode: "standard",
      lengthMode: "standard"
    },
    studyTimeMinutes: 0,
    solvedCount: 0,
    testsTaken: 0,
    rankPrediction: "Aspirant"
  };

  const createdUser = db.insert('users', newUser);
  // Remove password from response
  const { password: _, ...userResponse } = createdUser;
  res.status(201).json(userResponse);
});

// Login user
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const user = db.findOne('users', { username, password });
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Check and update daily streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let newStreak = user.streak || 1;
  let newCoins = user.coins || 100;
  let earnedBadge = null;

  if (user.lastActiveDate === yesterday) {
    newStreak += 1;
    newCoins += 10; // Reward for maintaining streak
    
    // Check if they earned a streak badge
    if (newStreak === 3 && !user.badges.includes("Streak Master (3 Days)")) {
      user.badges.push("Streak Master (3 Days)");
      earnedBadge = "Streak Master (3 Days)";
    }
  } else if (user.lastActiveDate !== today) {
    newStreak = 1; // Reset streak if missed days
  }

  db.update('users', { id: user.id }, {
    streak: newStreak,
    coins: newCoins,
    lastActiveDate: today,
    badges: user.badges
  });

  const updatedUser = db.findOne('users', { id: user.id });
  const { password: _, ...userResponse } = updatedUser;
  
  res.json({
    user: userResponse,
    streakEarned: newStreak > user.streak,
    earnedBadge
  });
});

// Get user profile/status
router.get('/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const user = db.findOne('users', { id: userId });
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { password: _, ...userResponse } = user;
  res.json(userResponse);
});

// Update user stats or preferences
router.patch('/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const { preferences, studyTimeMinutes, solvedCount, testsTaken } = req.body;

  const user = db.findOne('users', { id: userId });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const updates = {};
  if (preferences) {
    updates.preferences = { ...user.preferences, ...preferences };
  }
  if (studyTimeMinutes !== undefined) {
    updates.studyTimeMinutes = (user.studyTimeMinutes || 0) + studyTimeMinutes;
    
    // Badge for studying
    if (updates.studyTimeMinutes >= 25 && !user.badges.includes("Pomodoro Focus")) {
      user.badges.push("Pomodoro Focus");
    }
  }
  if (solvedCount !== undefined) {
    updates.solvedCount = (user.solvedCount || 0) + solvedCount;
  }
  if (testsTaken !== undefined) {
    updates.testsTaken = (user.testsTaken || 0) + testsTaken;
  }
  updates.badges = user.badges;

  db.update('users', { id: userId }, updates);
  
  const updatedUser = db.findOne('users', { id: userId });
  const { password: _, ...userResponse } = updatedUser;
  res.json(userResponse);
});

export default router;
