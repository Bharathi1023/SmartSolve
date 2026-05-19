import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import Route Handlers
import authRouter from './routes/auth.js';
import solverRouter from './routes/solver.js';
import testsRouter from './routes/tests.js';
import notesRouter from './routes/notes.js';
import socialRouter from './routes/social.js';
import coursesRouter from './routes/courses.js';
import liveClassesRouter from './routes/liveClasses.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes Mounting
app.use('/api/auth', authRouter);
app.use('/api/solver', solverRouter);
app.use('/api/tests', testsRouter);
app.use('/api/notes', notesRouter);
app.use('/api/social', socialRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/liveClasses', liveClassesRouter);

// serve a gorgeous welcome status page on backend root to guide user to port 5173
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: system-ui, sans-serif; background: #090d16; color: white; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 20px;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); padding: 16px; border-radius: 16px; margin-bottom: 20px; font-size: 40px; width: fit-content;">🧠</div>
      <h1 style="margin: 0 0 10px 0; font-size: 28px;">SmartSolve API Server is Online! 🚀</h1>
      <p style="color: #94a3b8; font-size: 16px; max-width: 500px; line-height: 1.6; margin-bottom: 30px;">
        This is the Express backend engine. The actual visual student dashboard is currently running on the React frontend dev port.
      </p>
      <a href="http://localhost:5173" style="background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); color: white; padding: 14px 28px; border-radius: 8px; font-weight: bold; text-decoration: none; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); display: inline-flex; align-items: center; gap: 8px;">
        Open React Student Dashboard →
      </a>
      <p style="color: #64748b; font-size: 12px; margin-top: 40px;">SmartSolve Full-Stack Core API • Running on Port 5000</p>
    </div>
  `);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: "healthy", service: "SmartSolve Core API", time: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err.stack);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`   🚀 SMARTSOLVE EXPRESS BACKEND IS ONLINE! 🚀    `);
  console.log(`   Running on: http://localhost:${PORT}           `);
  console.log(`==================================================`);
});
