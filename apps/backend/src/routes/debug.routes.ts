import express, { Router } from 'express';
import { EventModel } from '../models/event.model.js';
import { SessionModel } from '../models/session.model.js';

const router: Router = express.Router();

router.post('/', async (req, res) => {
  try {
    await Promise.all([
      EventModel.deleteMany({}),
      SessionModel.deleteMany({})
    ]);
    res.status(200).json({ success: true, message: 'Database cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reset database' });
  }
});

export default router;
