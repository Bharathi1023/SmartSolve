import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// 1. Get all available mock tests
router.get('/', (req, res) => {
  const tests = db.getCollection('mockTests');
  if (req.query.subject) {
    const filtered = tests.filter(t => t.subject.toLowerCase() === req.query.subject.toLowerCase());
    return res.json(filtered);
  }
  res.json(tests);
});

// 1.5 Generate AI Smart Test
router.post('/generate', (req, res) => {
  const { subject, difficulty, mode, duration } = req.body;
  const tests = db.getCollection('mockTests');
  
  let availableTests = tests;
  if (subject) {
    availableTests = tests.filter(t => t.subject.toLowerCase() === subject.toLowerCase());
  }

  let allQuestions = [];
  availableTests.forEach(t => {
    allQuestions = allQuestions.concat(t.questions || []);
  });

  // Shuffle questions randomly
  allQuestions = allQuestions.sort(() => Math.random() - 0.5);

  let qCount = duration || 15;
  if (qCount > allQuestions.length) qCount = allQuestions.length;
  if (qCount < 5 && allQuestions.length >= 5) qCount = 5;

  if (qCount === 0) {
    // Basic fallback if no questions exist in DB for this subject
    return res.json({
      id: `smart_test_${Date.now()}`,
      title: `AI Generated ${mode} Test`,
      subject: subject || "General",
      difficulty: difficulty || "Medium",
      duration: duration || 15,
      questions: [
        {
          id: 'q1',
          question: `What is the most fundamental concept in ${subject}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          explanation: 'This is a generated explanation.'
        }
      ]
    });
  }

  const selectedQuestions = allQuestions.slice(0, qCount).map((q, idx) => ({
    ...q,
    id: `ai_q_${Date.now()}_${idx}`
  }));

  res.json({
    id: `smart_test_${Date.now()}`,
    title: `AI Generated ${mode} Test (${difficulty})`,
    subject: subject || "General",
    difficulty: difficulty || "Medium",
    duration: duration || 15,
    questions: selectedQuestions
  });
});

// 2. Submit mock test answers and evaluate
router.post('/submit', (req, res) => {
  const { userId, testId, answers, timeSpentSeconds } = req.body;

  if (!userId || !testId || !answers) {
    return res.status(400).json({ error: "Missing required submission fields" });
  }

  const test = db.findOne('mockTests', { id: testId });
  if (!test) {
    return res.status(404).json({ error: "Test not found" });
  }

  const questions = test.questions;
  let correctCount = 0;
  const detailedResults = [];
  const weakTopics = new Set();

  questions.forEach((q, index) => {
    const userAnswerIndex = answers[q.id];
    const isCorrect = userAnswerIndex === q.correctAnswer;
    
    if (isCorrect) {
      correctCount++;
    } else {
      // Flag weak topics based on subject or specific tags
      if (test.subject === 'Mathematics') {
        weakTopics.add('Quadratic Formula Calculation' + (index === 0 ? ' (Roots Derivation)' : ''));
      } else if (test.subject === 'Science') {
        weakTopics.add('Chemical Equation Balancing' + (index === 0 ? ' (Reaction Types)' : ''));
      }
    }

    detailedResults.push({
      questionId: q.id,
      question: q.question,
      options: q.options,
      userAnswer: userAnswerIndex !== undefined ? q.options[userAnswerIndex] : "Not Answered",
      correctAnswer: q.options[q.correctAnswer],
      isCorrect,
      explanation: q.explanation,
      wrongOptionExplanation: q.wrongOptionExplanation || null
    });
  });

  const totalQuestions = questions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // Store the user test result
  const userTestResult = {
    userId,
    testId,
    testTitle: test.title,
    subject: test.subject,
    score: scorePercent,
    correctCount,
    totalQuestions,
    timeSpentSeconds,
    date: new Date().toISOString(),
    results: detailedResults
  };

  const savedResult = db.insert('userTests', userTestResult);

  // Update user stats, daily coins reward, rank prediction
  const user = db.findOne('users', { id: userId });
  if (user) {
    let currentCoins = user.coins || 0;
    let testsTaken = (user.testsTaken || 0) + 1;
    let badges = user.badges || [];
    
    // Reward coins
    currentCoins += 20; // Timed mock test rewards!
    if (scorePercent >= 80) {
      currentCoins += 15; // Bonus for high scores
    }

    // Badge rewards
    if (scorePercent === 100 && !badges.includes("Centum Performer")) {
      badges.push("Centum Performer");
    }
    if (testsTaken === 3 && !badges.includes("Exam Gladiator")) {
      badges.push("Exam Gladiator");
    }

    // Calculate rank prediction dynamically
    let rankPrediction = "Aspirant";
    if (testsTaken >= 3) {
      if (scorePercent >= 85) rankPrediction = "Rank Holder (Legend)";
      else if (scorePercent >= 65) rankPrediction = "Scholar (Distinction)";
      else rankPrediction = "Achiever (First Class)";
    } else {
      if (scorePercent >= 75) rankPrediction = "Rising Star (Class Leader)";
      else rankPrediction = "Aspirant";
    }

    db.update('users', { id: userId }, {
      coins: currentCoins,
      testsTaken,
      badges,
      rankPrediction
    });
  }

  res.json({
    resultId: savedResult.id,
    score: scorePercent,
    correctCount,
    totalQuestions,
    weakTopics: Array.from(weakTopics),
    timeSpentSeconds,
    detailedResults
  });
});

// 3. Get user's past mock test results
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  const history = db.find('userTests', { userId }).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(history);
});

// 4. Get Leaderboard (global rank based on coins & solving activity)
router.get('/leaderboard', (req, res) => {
  const users = db.getCollection('users');
  
  // Create beautiful global leaderboard with real and mock students for board exam feel!
  const mockStudents = [
    { username: "Aditya Hegde (99% CBSE)", coins: 540, streak: 8, rankPrediction: "Rank Holder (Legend)", testsTaken: 12, studyTimeMinutes: 240 },
    { username: "Nisarga K.", coins: 410, streak: 5, rankPrediction: "Scholar (Distinction)", testsTaken: 9, studyTimeMinutes: 180 },
    { username: "Praveen Gowda", coins: 380, streak: 4, rankPrediction: "Scholar (Distinction)", testsTaken: 7, studyTimeMinutes: 150 }
  ];

  const activeLeaderboard = users.map(u => ({
    username: u.username,
    coins: u.coins,
    streak: u.streak,
    rankPrediction: u.rankPrediction,
    testsTaken: u.testsTaken || 0,
    studyTimeMinutes: u.studyTimeMinutes || 0
  })).concat(mockStudents);

  // Sort descending by coins
  activeLeaderboard.sort((a, b) => b.coins - a.coins);

  res.json(activeLeaderboard.slice(0, 10)); // Top 10
});

export default router;
