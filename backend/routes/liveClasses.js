import express from 'express';
import db from '../database/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const classes = db.getCollection('liveClasses');
  res.json(classes);
});

router.get('/videos', (req, res) => {
  const videos = db.getCollection('videoLectures');
  res.json(videos);
});

export default router;
