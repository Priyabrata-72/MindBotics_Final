// routes/feedbackRoutes.js
import express from "express";
import Feedback from "../model/feedback.js"; // ← default import + correct filename

const router = express.Router();

// POST /api/feedback — Submit new feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, feedback } = req.body;

    if (!name || !email || !rating || !feedback) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const newFeedback = new Feedback({
      name,
      email,
      rating,
      feedback,
    });

    await newFeedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid input data.' });
    }
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

export default router; // ← ES Module export