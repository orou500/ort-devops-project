const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Email must be valid']
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId; // סיסמה נדרשת רק אם אין googleId
        },
        minlength: [6, 'Password must be at least 6 characters'],
    },
    googleId: {
        type: String,
        required: false // נדרש רק עבור חיבורי Google
    },
    firstName: {
        type: String,
        required: [true, 'Please enter your first name'],
        minlength: [2, 'First name must be at least 2 characters'],
    },
    lastName: {
        type: String,
        required: [true, 'Please enter your last name'],
        minlength: [2, 'Last name must be at least 2 characters'],
    },
    verify: {
        type: Boolean, 
        default: false
    },
    admin: {
        type: Boolean, 
        default: false
    },
    createdLeague: {
        type: Boolean, 
        default: false
    },
    leaguesId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League'
    }],
    tournamentsId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament'
    }],
    firstPlaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament'
    }],
    secondPlaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament'
    }],
    KOG: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament'
    }],
    KOA: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament'
    }],
    profileImage: {
        type: String, // URL לתמונת הפרופיל
    },
    dateOfBirth: {
        type: Date // תאריך הלידה של המשתמש
    },
    gender: {
        type: String,
        enum: ['זכר', 'נקבה', 'אחר'],
    }
},
{
    timestamps: true,
});

// לפני שמירת המסמך, ביצוע הצפנת סיסמה (אם לא מדובר בחיבור Google)
userSchema.pre('save', async function (next) {
    if (this.password && !this.googleId) { // הצפנה רק אם קיימת סיסמה ואין googleId
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
