const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Quiz = require('../models/quiz');
const Question = require('../models/question');
const QuizAttempt = require('../models/quizAttempt');
const ProgressReport = require('../models/progressReport');
const { authenticateToken } = require('../middleware/auth');

// Get all quizzes (active only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ status: { $ne: 'deleted' } });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quizzes by grade (active only)
router.get('/grade/:grade', authenticateToken, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ grade: req.params.grade, status: { $ne: 'deleted' } });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get quiz by lesson
router.get('/lesson/:lessonId', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ lesson_id: req.params.lessonId });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific quiz
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create quiz
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check user role
    if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Log the request safely
    console.log('Submitting quiz:', req.body);

    // Destructure data from req.body
    const { quiz_title, quiz_type, time_limit, total_questions, grade, lesson_id, questions } = req.body;

    // Validate required fields
    if (!quiz_title || quiz_title.trim() === '') {
      return res.status(400).json({ message: 'Quiz title is required' });
    }

    if (!quiz_type || quiz_type.trim() === '') {
      return res.status(400).json({ message: 'Quiz type is required' });
    }

    const timeLimitNum = Number(time_limit);
    const totalQuestionsNum = Number(total_questions);

    if (isNaN(timeLimitNum) || timeLimitNum <= 0) {
      return res.status(400).json({ message: 'Time limit must be a positive number' });
    }

    if (isNaN(totalQuestionsNum) || totalQuestionsNum <= 0) {
      return res.status(400).json({ message: 'Total questions must be a positive number' });
    }

    if (!grade || !['10', '11'].includes(grade)) {
      return res.status(400).json({ message: 'Grade must be either 10 or 11' });
    }

    // Prepare quiz object
    const quizData = {
      quiz_title,
      quiz_type,
      time_limit: timeLimitNum,
      total_questions: totalQuestionsNum,
      grade,
      lesson_id: lesson_id && mongoose.Types.ObjectId.isValid(lesson_id) ? lesson_id : undefined,
      questions: Array.isArray(questions) ? questions : [],
      status: 'active',
      created_date: new Date()
    };

    // Save quiz
    const newQuiz = await new Quiz(quizData).save();
    console.log('Quiz created successfully:', newQuiz._id);

    res.status(201).json(newQuiz);

  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz attempt
router.post('/:id/attempt', authenticateToken, async (req, res) => {
  try {
    const { answers, score } = req.body;
    const attempt = new QuizAttempt({
      user: req.user.userId,
      quiz: req.params.id,
      answers,
      score,
      completed_at: new Date()
    });
    const savedAttempt = await attempt.save();

    // Update progress report to mark lesson as completed
    const quiz = await Quiz.findById(req.params.id);
    if (quiz && quiz.lesson_id) {
      await ProgressReport.findOneAndUpdate(
        { user: req.user.userId, lesson: quiz.lesson_id },
        { completed: true, score: score, last_updated: new Date() },
        { upsert: true, new: true }
      );
    }

    res.status(201).json(savedAttempt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update quiz
router.put('/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete quiz (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id, 
      { status: 'deleted', deleted_date: new Date() },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz moved to recycle bin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get deleted quizzes
router.get('/deleted/all', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const quizzes = await Quiz.find({ status: 'deleted' }).sort({ deleted_date: -1 });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Restore quiz
router.post('/:id/restore', authenticateToken, async (req, res) => {
  if (!['admin', 'teacher'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id, 
      { status: 'active', $unset: { deleted_date: 1 } },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz restored successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Permanently delete quiz
router.delete('/:id/permanent', authenticateToken, async (req, res) => {
  if (!['admin'].includes(req.user.effectiveRole)) {
    return res.status(403).json({ message: 'Access denied - only admins can permanently delete' });
  }

  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json({ message: 'Quiz permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;