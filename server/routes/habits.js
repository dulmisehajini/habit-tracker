const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Helper function to calculate streak
const calculateStreak = (logs) => {
  if (logs.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logDates = logs.map(log => {
    const d = new Date(log.completed_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }).sort((a, b) => b - a);

  let streak = 0;
  let checkDate = new Date(today);

  for (let i = 0; i < logDates.length; i++) {
    if (logDates[i] === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (logDates[i] < checkDate.getTime()) {
      break;
    }
  }

  return streak;
};

// GET all habits with streak and last 7 days logs
router.get('/', authenticateToken, async (req, res) => {
  try {
    const habitsResult = await pool.query(
      'SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );

    const habits = habitsResult.rows;

    // for each habit get logs and calculate streak
    const habitsWithStats = await Promise.all(habits.map(async (habit) => {
      // get last 7 days logs
      const logsResult = await pool.query(
        `SELECT completed_date FROM habit_logs 
         WHERE habit_id = $1 
         AND completed_date >= CURRENT_DATE - INTERVAL '6 days'
         ORDER BY completed_date DESC`,
        [habit.id]
      );

      // get all logs for streak calculation
      const allLogsResult = await pool.query(
        'SELECT completed_date FROM habit_logs WHERE habit_id = $1 ORDER BY completed_date DESC',
        [habit.id]
      );

      const streak = calculateStreak(allLogsResult.rows);
      const last7Days = logsResult.rows.map(r => {
        const d = new Date(r.completed_date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      });

      return { ...habit, streak, last7Days };
    }));

    res.json(habitsWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create a new habit
router.post('/', authenticateToken, async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO habits (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update a habit
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'UPDATE habits SET name = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, description, id, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a habit
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    res.json({ message: 'Habit deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST mark habit as done today
router.post('/:id/log', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  try {
    const result = await pool.query(
      'INSERT INTO habit_logs (habit_id, completed_date) VALUES ($1, $2) RETURNING *',
      [id, today]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;