const Interest = require('./models/Interest');
const UserModel = require('./models/userModel');


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
  


  //UserReg
  app.post('/signup', async (req, res) => {
    console.log('Request body:', req.body); // Add this line to log the incoming data
    try {
      const { email, password, fullname, username, date_of_birth, location } = req.body;
  
      if (!email || !password || !fullname || !username || !date_of_birth || !location) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email is already in use. Griffins' });
      }
  
      const newUser = new UserModel({
        email,
        password, // Make sure to hash the password before saving it to the database
        fullname,
        username,
        date_of_birth,
        location,
      });
  
      await newUser.save();
      res.status(201).json({ message: 'User created successfully.', user: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user.' });
    }
  });
  
//fetching  userdata after Authentication
// Fetch user data by ID


//profile
// Fetch user data by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Remove the password field from the response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Error fetching user data.' });
  }
});