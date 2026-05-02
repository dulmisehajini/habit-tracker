const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db');

const habitsRouter = require('./routes/habits');
const authRouter = require('./routes/auth');


const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Habit Tracker API is running!' });
});

app.use('/api/habits', habitsRouter);
app.use('/api/auth', authRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));