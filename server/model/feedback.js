// models/feedback.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  rating: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Average', 'Poor'],
  },
  feedback: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Feedback', feedbackSchema);