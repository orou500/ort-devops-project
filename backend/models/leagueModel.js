const mongoose = require('mongoose')
const slugify = require('slugify');

const FakeUserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: [2, 'First name must be at least 2 characters'],
    },
    lastName: {
        type: String,
        required: true,
        minlength: [2, 'Last name must be at least 2 characters'],
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
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
    }]
});

const LeagueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please enter title"],
        unique: true,
        minlength: [6, 'Title must be at least 6 charcters'],
        maxlength: [50, 'Title must be under 50 charcters']
    },
    slug: { 
        type: String,
        required: true,
        unique: true
    },
    createdBy: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Please enter createdBy"],
    },
    adminsId: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Please enter adminsId"],
    }],
    usersId: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tournamentsId: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Tournament'
    }],
    firstPlaces: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    secondPlaces: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    KOG: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    KOA: [{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Tournament'
    }],
    fakeUsers: [FakeUserSchema],
},
{
    timestamps: true,
}
)

LeagueSchema.pre('validate', function(next) {
    if (this.title) {
        const isHebrew = /[\u0590-\u05FF]/.test(this.title);
        
        if (isHebrew) {
            this.slug = this.slug = this.title.replace(/\s+/g, '-'); 
        } else {
            this.slug = slugify(this.title, { lower: true, strict: true });
        }
    }

    if (this.markedown) {
        this.sanitizedHtml = dompurify.sanitize(marked(this.markedown));
    }
    
    next();
});

module.exports = mongoose.model('League', LeagueSchema);