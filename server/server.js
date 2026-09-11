require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/problems', require('./routes/problemRoutes'));
app.use('/api/attempts', require('./routes/attemptRoutes'));

app.get('/', (req, res) => {
  res.send('LLD Practice Platform API running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));