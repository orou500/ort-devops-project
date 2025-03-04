const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const User = require('./models/userModel');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authRoutes = require('./routes/authRoutes');
const leagueRoutes = require('./routes/leagueRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3010;

// הגדרת מגבלות בקשות
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 דקות
    max: 250, // הגבלת מקסימום 250 בקשות בכל חלון זמן
    message: 'יותר מידי בקשות, נסה שוב מאוחר יותר.'
});

// חיבור ה-limiter לכל הבקשות
app.use(limiter);

// סשן ואיתחול Passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// הגדרת אסטרטגיית Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL_DEV}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // בדוק אם המשתמש כבר קיים ב-DB על פי כתובת המייל
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        // יצירת משתמש חדש אם הוא לא קיים
        user = await User.create({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          profileImage: profile.photos[0]?.value,
          googleId: profile.id,
          verify: true, // מכיוון שהוא נרשם עם גוגל, נניח שהוא מאומת כבר
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// שימוש ב-middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// הגדרת headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// חיבור ל-MongoDB
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_URL_DEV}/`)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// שימוש ב-middleware של מסלולים
app.use(authRoutes);
app.use(leagueRoutes);
app.use(tournamentRoutes);

// מסלול לשגיאות
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  res.json({
    error: {
      message: error.message,
    },
  });
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
