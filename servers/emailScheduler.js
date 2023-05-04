// //////////////////////////////////
// const nodemailer = require('nodemailer');
// const cron = require('node-cron');
// const astrologyApi = require('./astrologyApi'); // Replace with the actual library or API you're using

// // Configure your email service (e.g., Gmail, SendGrid, etc.) here
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'theeoduol@gmail.com', // Your Gmail email address
//     pass: 'theeoduol001', // Your Gmail password
//   },
// });

// const sendHoroscopeEmail = async (user) => {
//   const { email, username, location, dateOfBirth } = user;
  
//   const birthData = {
//     date: dateOfBirth,
//     location: location
//   };
  
//   const horoscope = await astrologyApi.getHoroscope(birthData); // Replace with the actual method to get horoscope

//   // Send the email
//   const mailOptions = {
//     from: 'theeoduol@gmail.com', // Your email address or alias
//     to: email,
//     subject: 'Your Weekly Horoscope',
//     html: `<p>Dear ${username},</p>
//            <p>Here is your personalized horoscope for this week:</p>
//            <p>${horoscope}</p>
//            <p>Best regards,</p>
//            <p>Your Astrology Team</p>`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log('Error sending email:', error);
//     } else {
//       console.log('Email sent:', info.response);
//     }
//   });
// };

// const scheduleWeeklyHoroscopeEmails = async (users) => {
//   // Schedule a task to run every Monday at 00:00
//   cron.schedule('0 0 * * 1', () => {
//     users.forEach((user) => {
//       sendHoroscopeEmail(user);
//     });
//   });
// };

// module.exports = {
//   scheduleWeeklyHoroscopeEmails,
// };



const nodemailer = require('nodemailer');
const cron = require('node-cron');
const astrologyApi = require('./astrologyApi'); // Replace with the actual library or API you're using

// Configure your email service (e.g., Gmail, SendGrid, etc.) here
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'theeoduol@gmail.com', // Your Gmail email address
    pass: 'theeoduol001', // Your Gmail password
  },
});

const sendHoroscopeEmail = async (user) => {
  const { email, username, location, dateOfBirth } = user;
  
  const birthData = {
    date: dateOfBirth,
    location: location
  };
  
  const horoscope = await astrologyApi.getHoroscope(birthData); // Replace with the actual method to get horoscope

  // Send the email
  const mailOptions = {
    from: 'theeoduol@gmail.com', // Your email address or alias
    to: email,
    subject: 'Your Horoscope',
    html: `<p>Dear ${username},</p>
           <p>Here is your personalized horoscope:</p>
           <p>${horoscope}</p>
           <p>Best regards,</p>
           <p>Your Astrology Team</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const scheduleHoroscopeEmails = async (users) => {
  // Send the horoscope email immediately
  users.forEach((user) => {
    sendHoroscopeEmail(user);
  });

  // Schedule a task to run every 1 minute
  cron.schedule('*/1 * * * *', () => {
    users.forEach((user) => {
      sendHoroscopeEmail(user);
    });
  });
};

module.exports = {
  scheduleHoroscopeEmails,
};
