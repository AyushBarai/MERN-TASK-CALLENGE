const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const transactionRoutes = require('./routes/transactionRoutes');
const { initializeDatabase } = require('./controllers/transactionController');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mern-coding-challenge', {})
  .then(() => {
    console.log('Connected to MongoDB');
    // Initialize database with seed data
    initializeDatabase();
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes
app.use('/api', transactionRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
