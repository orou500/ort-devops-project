const mongoose = require('mongoose');
const slugify = require('slugify');

const TournamentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter title"],
        unique: true,
        minlength: [6, 'Title must be at least 6 charcters'],
        maxlength: [50, 'Title must be under 50 charcters']
    },
    firstPlace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    secondPlace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    KOG: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    KOA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tournamentData: [[{
        team1: {
            type: String, // שם קבוצה 1
        },
        team2: {
            type: String, // שם קבוצה 2
        },
        score1: {
            type: Number, // תוצאה של קבוצה 1
        },
        score2: {
            type: Number, // תוצאה של קבוצה 2
        }
    }]],
    groupStage: [ // שינוי זה כדי לכלול את הנתונים של הgroups
        {
            id: {
                type: Number, // מזהה הבית
            },
            teams: [ // מערך קבוצות בבית
                {
                    id: { 
                        type: String, // מזהה קבוצה
                    },
                    name: { 
                        type: String, // שם קבוצה
                    },
                    points: { 
                        type: Number, // מספר נקודות
                    }
                }
            ]
        }
    ], 
    playerGoals: [{
        name: {
            type: String,
        },
        goals: {
            type: Number,
        },
    }],
    playerAssists: [{
        name: {
            type: String,
        },
        assists: {
            type: Number,
        },
    }],
    images: [{ 
        type: String, // מערך של כתובות URL לתמונות
    }],
    slug: { 
        type: String,
        required: true,
        unique: true
    },
    usersId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    leagueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League'
    },
}, 
{
    timestamps: true,
});

TournamentSchema.pre('validate', function (next) {
    if (this.title) {
        const isHebrew = /[\u0590-\u05FF]/.test(this.title);

        if (isHebrew) {
            this.slug = this.title.replace(/\s+/g, '-');
        } else {
            this.slug = slugify(this.title, { lower: true, strict: true });
        }
    }

    next();
});

module.exports = mongoose.model('Tournament', TournamentSchema);
