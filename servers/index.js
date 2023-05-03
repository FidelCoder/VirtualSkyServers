// app.use(cors(corsOptions));
const cors = require('cors');
////////////////////////////////
const { getSunSign, getChineseZodiac } = require('./astrology');
const AstrologyData = require('./models/astrologyData');

// // Add this line to handle OPTIONS requests
// app.options('*', cors(corsOptions));


const Interest = require('./models/Interest');
const UserModel = require('./models/userModel');

const express = require('express');
const mongoose = require('mongoose');
//const cors = require('cors');
const dotenv = require('dotenv');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://virtual-sky.vercel.app',
  'https://virtual-sky-servers-dkix.vercel.app',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));


// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       'http://localhost:3000',
//       'https://virtual-sky.vercel.app',
//       'https://virtual-sky-servers-dkix.vercel.app',
//     ];
    
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);  
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

// Create a middleware function to set CORS headers
// const corsMiddleware = (req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000, https://virtual-sky.vercel.app, https://virtual-sky-servers-dkix.vercel.app');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   );
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET, POST, PUT, DELETE, OPTIONS'
//   );
//   res.setHeader('Access-Control-Allow-Credentials', 'true');

//   next();
// };

// // // Use the middleware in your app
// app.use(corsMiddleware);



// app.use(cors(corsOptions));

// const corsOptions = {
//   origin: '*',
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

// app.use(cors(corsOptions));

// app.options('*', cors(corsOptions));
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
  res.send('VirtualSky Servers working ');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

///////////////////////////////////////////////////////////////////////
//const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

////////////////////////////////////////////////////////////////////////
const Course = require('./models/courses');
app.post('/courses', authMiddleware, async (req, res) => {
  const { title } = req.body;
  const userId = req.user.userId; // Get the user ID from the decoded JWT token

  const newCourse = new Course({ title, userId });

  try {
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Make sure to use the middleware for parsing JSON body
// Save astrology data
app.post('/api/saveAstrologyData', async (req, res) => {
  const { userId, day, month, year } = req.body;

  const sunSign = getSunSign(day, month);
  const chineseZodiac = getChineseZodiac(year);

  const astrologyData = new AstrologyData({
    user: userId,
    sunSign,
    chineseZodiac,
  });

  try {
    await astrologyData.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch astrology data
app.get('/api/getAstrologyData/:userId', async (req, res) => {
  try {
    const astrologyData = await AstrologyData.findOne({ user: req.params.userId });
    res.json(astrologyData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Interests Post
// Interests Post
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

    // Fetch the updated user with the username and interests fields
    const updatedUser = await UserModel.findById(userId).select('username interests');

    res.status(201).json({ interests: newInterests, user: updatedUser });
  } catch (error) {
    console.error('Error saving interests:', error);
    res.status(500).json({ message: 'Error saving interests.' });
  }
});


// Interests Get
// Interests Get by User ID
app.get('/api/users/:userId/interests', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const interests = await Interest.find({ userId });

    if (!interests) {
      return res.status(404).json({ message: 'Interests not found.' });
    }

    res.status(200).json(interests);
  } catch (error) {
    console.error('Error fetching interests data:', error);
    res.status(500).json({ message: 'Error fetching interests data.' });
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
// function isValidObjectId(value) {
//   return mongoose.Types.ObjectId.isValid(value);
// }

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


//Generate courses
const axios = require('axios');

app.post('/generateCourses', async (req, res) => {
  const { interests, token } = req.body;

  try {
    // Replace with your actual API key
    const apiKey = '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';
    const url = 'https://api.openai.com/v1/engines/text-davinci-002/completions';

    const response = await axios.post(
      url,
      {
        prompt: `Generate a list of courses related to ${interests.join(', ')}`,
        max_tokens: 100,
        n: 5,
        stop: null,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    const courses = response.data.choices.map((choice) => choice.text);
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error generating courses:', error.response.data);
    res.status(500).json({ message: 'Error generating courses.' });
  }
  
});


module.exports = app;