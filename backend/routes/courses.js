import express from 'express';
import db from '../database/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const courses = db.getCollection('courses');
  res.json(courses);
});

export default router;
