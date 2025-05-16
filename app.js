require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const session = require('express-session');
const methodOverride = require('method-override');

const port = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // ✅ Required for JSON body parsing
app.use('/api', apiRoutes); // ✅ Route for Gemini API
app.use(methodOverride('_method'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboardcat', // use a strong secret in production
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // from your .env file
        collectionName: 'sessions',     // optional
        //ttl: 14 * 24 * 60 * 60           // optional: 14 days
    })
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use(authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/', discussionRoutes);

// Sample Routes
app.get('/', (req, res) => {
    res.render('auth/auth');
});

app.get('/profile', (req, res) => {
    res.redirect('/user/profile');
});

// MongoDB + Server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(port, () => console.log(`Server running on ${port}`));
    })
    .catch((err) => console.log(err));
