app.use(cors(corsOptions));
app.use(express.json());

// Add this line to handle OPTIONS requests
app.options('*', cors(corsOptions));


const Interest = require('./models/Interest');
const UserModel = require('./models/userModel');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();


// Middleware
const corsOptions = {
  origin: 'https://virtual-sky.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'Virtualsky', 'Astro']
}


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
  res.send('VirtualSky Servers working ');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Interests
app.post('/api/users/:userId/interests', async (req, res) => {
  try {
    const { userId } = req.params;
    const { interests } = req.body;

    if (!interests || interests.length === 0) {
      return res.status(400).json({ message: 'No interests provided.' });
    }

    const newInterests = await Interest.insertMany(
      interests.map((interest) => ({ interest, userId }))
    );

    res.status(201).json({ interests: newInterests });
  } catch (error) {
    console.error('Error saving interests:', error);
    res.status(500).json({ message: 'Error saving interests.' });
  }
});

  //UserReg
  app.post('/signup', async (req, res) => {
    try {
      const { email, password, fullname, username, date_of_birth, location } = req.body;
  
      if (!email || !password || !fullname || !username || !date_of_birth || !location) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: 'Email is already in use.' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);
  
      const newUser = new UserModel({
        email,
        password: hashedPassword,
        fullname,
        username,
        date_of_birth,
        location,
      });
  
      await newUser.save();
  
      // Generate a JWT token
      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        'eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.bQTnz6AuMJvmXXQsVPrxeQNvzDkimo7VNXxHeSBfClLufmCVZRUuyTwJF311JHuh', // Replace this with your actual secret key
        { expiresIn: '1h' }
      );
  
      res.status(201).json({ message: 'User created successfully.', token, expiresIn: 3600, userId: newUser._id });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Error creating user.' });
    }
  });

//LoginAPI
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const expiresIn = 3600; // Add this line to define expiresIn
      
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        'your_jwt_secret_key',
        { expiresIn } // Use expiresIn here
      );

      const responseData = {
        message: 'Logged in successfully.',
        user,
        userId: user._id,
        token,
        expiresIn, // Add expiresIn to the response
      };

      console.log('Login response:', responseData);
      res.status(200).json(responseData);
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in.' });
  }
});

//Fetch data from db
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


module.exports = app;