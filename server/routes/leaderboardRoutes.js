const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/leaderboard');
const QuizAttempt = require('../models/quizAttempt');
const { authenticateToken } = require('../middleware/auth');

// Get leaderboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Aggregate scores from quiz attempts
    const leaderboard = await QuizAttempt.aggregate([
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          attempts: { $sum: 1 },
          averageScore: { $avg: '$score' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          username: '$user.username',
          totalScore: 1,
          attempts: 1,
          averageScore: { $round: ['$averageScore', 2] }
        }
      },
      {
        $sort: { totalScore: -1, averageScore: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;