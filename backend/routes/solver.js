import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../database/db.js';
import { solveQuestion } from '../ai/solver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer upload configurations
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 1. Solve doubt route (text or speech transcript input)
router.post('/solve', async (req, res) => {
  const { text, userId, mode, lengthMode, language } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Question text is required" });
  }

  try {
    const solution = await solveQuestion({ text, mode, lengthMode, language });
    
    // Save to solved history if userId is provided
    if (userId) {
      const historyItem = {
        userId,
        title: text.length > 50 ? text.substring(0, 50) + "..." : text,
        question: text,
        subject: solution.subject,
        solution: solution.answer,
        steps: solution.steps,
        diagram: solution.diagram,
        mathSolved: solution.mathSolved,
        mathData: solution.mathData,
        date: new Date().toISOString()
      };
      
      const insertedItem = db.insert('papers', historyItem);
      
      // Reward user with coins for solving doubts
      const user = db.findOne('users', { id: userId });
      if (user) {
        let currentCoins = user.coins || 0;
        let solvedCount = user.solvedCount || 0;
        let badges = user.badges || [];
        
        currentCoins += 5; // +5 coins
        solvedCount += 1;

        if (solvedCount === 5 && !badges.includes("Curious Solver")) {
          badges.push("Curious Solver");
        }

        db.update('users', { id: userId }, { 
          coins: currentCoins, 
          solvedCount,
          badges 
        });
      }
      
      return res.json({ solution, historyId: insertedItem.id });
    }

    res.json({ solution });
  } catch (error) {
    console.error("Solver error:", error);
    res.status(500).json({ error: "Failed to solve the question. Please try again." });
  }
});

// 2. Upload Paper route (image or PDF)
router.post('/upload', upload.single('file'), async (req, res) => {
  const { userId, mode, lengthMode, language } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file was uploaded." });
  }

  try {
    // Standard mock OCR (Text Extraction) engine based on file types / typical names
    let extractedText = "What are the roots of 2x^2 - 5x + 3 = 0?"; // Default OCR test
    let filename = file.originalname.toLowerCase();

    // Contextual OCR matching for a wow demo effect!
    if (filename.includes('math') || filename.includes('quad') || filename.includes('algebra')) {
      extractedText = "Solve the quadratic equation x^2 - 4x + 4 = 0 and explain the nature of roots.";
    } else if (filename.includes('chem') || filename.includes('react') || filename.includes('iron')) {
      extractedText = "What happens when iron filings are added to a solution of copper sulphate? Write equation.";
    } else if (filename.includes('physics') || filename.includes('force')) {
      extractedText = "Explain Newton's second law of motion and give its mathematical equation.";
    } else if (filename.includes('bio') || filename.includes('cell') || filename.includes('plant')) {
      extractedText = "Explain the process of photosynthesis and describe the chloroplast structure.";
    }

    const solution = await solveQuestion({ text: extractedText, mode, lengthMode, language });

    // Save to user's history
    let historyId = null;
    if (userId) {
      const historyItem = {
        userId,
        title: `Uploaded Paper: ${file.originalname}`,
        question: extractedText,
        subject: solution.subject,
        solution: solution.answer,
        steps: solution.steps,
        diagram: solution.diagram,
        mathSolved: solution.mathSolved,
        mathData: solution.mathData,
        fileName: file.originalname,
        date: new Date().toISOString()
      };
      const inserted = db.insert('papers', historyItem);
      historyId = inserted.id;

      // Update user coins and solve count
      const user = db.findOne('users', { id: userId });
      if (user) {
        let currentCoins = user.coins || 0;
        let solvedCount = user.solvedCount || 0;
        let badges = user.badges || [];
        
        currentCoins += 15; // Extra +15 coins reward for scanning papers!
        solvedCount += 1;

        if (!badges.includes("Scanner Pro")) {
          badges.push("Scanner Pro");
        }

        db.update('users', { id: userId }, { 
          coins: currentCoins, 
          solvedCount,
          badges 
        });
      }
    }

    res.json({
      ocrText: extractedText,
      solution,
      fileName: file.originalname,
      historyId
    });
  } catch (error) {
    console.error("Upload/OCR solver error:", error);
    res.status(500).json({ error: "Failed to process the uploaded paper." });
  }
});

// 3. Get solved history for user
router.get('/history/:userId', (req, res) => {
  const { userId } = req.params;
  const history = db.find('papers', { userId }).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(history);
});

// 4. Delete history item
router.delete('/history/:historyId', (req, res) => {
  const { historyId } = req.params;
  const deleted = db.delete('papers', { id: historyId });
  if (deleted > 0) {
    res.json({ message: "History item deleted successfully." });
  } else {
    res.status(404).json({ error: "History item not found." });
  }
});

export default router;
