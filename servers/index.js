const Interest = require('./models/Interest');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.error('Error connecting to MongoDB:', error));
db.once('open', () => console.log('Connected to MongoDB'));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Express server!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Interests

app.post('/api/interests', async (req, res) => {
    try {
      const { interests } = req.body;
  
      if (!interests || interests.length === 0) {
        return res.status(400).json({ message: 'No interests provided.' });
      }
  
      const newInterests = await Interest.insertMany(
        interests.map((interest) => ({ interest }))
      );
  
      res.status(201).json({ interests: newInterests });
    } catch (error) {
      console.error('Error saving interests:', error);
      res.status(500).json({ message: 'Error saving interests.' });
    }
  });
  
