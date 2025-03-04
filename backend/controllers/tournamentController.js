const League = require('../models/leagueModel');
const Tournament = require('../models/tournamentModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const maxAge = 15 * 60
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY, {
        expiresIn: maxAge,
    })
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // החלפה בין מקומות
    }
    return array;
}

// יצירת משחק חדש
exports.createTournament = async (req, res) => {
    try {
        const { leagueSlug } = req.params;
        const { tournamentData, groups, title, firstPlace, secondPlace, KOG, KOA, playerGoals, playerAssists, users, createdAt, images } = req.body;

        // בדיקה אם הליגה קיימת
        const league = await League.findOne({ slug: leagueSlug });
        if (!league) {
            return res.status(404).json({ error: 'ליגה לא נמצאה' });
        }

        // יצירת אובייקט חדש עבור הטורניר
        const newTournamentData = {
            title,
            firstPlace,  // ID של מקום ראשון
            secondPlace, // ID של מקום שני
            KOG,         // ID של מלך השערים
            KOA,         // ID של מלך הבישולים
            images,
            usersId: users.map(user => user._id), // הפיכת המשתמשים לרשימת IDs
            leagueId: league._id,
            createdAt,
        };

        if (tournamentData) newTournamentData.tournamentData = tournamentData;
        if (groups) newTournamentData.groupStage = groups;
        if (playerGoals) newTournamentData.playerGoals = playerGoals;
        if (playerAssists) newTournamentData.playerAssists = playerAssists;

        // יצירת טורניר חדש במסד הנתונים
        const newTournament = await Tournament.create(newTournamentData);

        // עדכון הליגה עם פרטי הטורניר החדש
        league.tournamentsId.push(newTournament._id);
        if (firstPlace) league.firstPlaces.push(firstPlace);
        if (secondPlace) league.secondPlaces.push(secondPlace);
        if (KOG) league.KOG.push(KOG);
        if (KOA) league.KOA.push(KOA);
        
        await league.save();

        // עדכון כל משתמש בליגה בהתאם לתפקיד שלו
        await Promise.all(users.map(async (user) => {
            const userId = user._id;

            // קביעת נתוני העדכון המתאימים
            const updateData = {
                $push: { tournamentsId: newTournament._id }
            };

            if (userId === firstPlace) updateData.$push.firstPlaces = newTournament._id;
            if (userId === secondPlace) updateData.$push.secondPlaces = newTournament._id;
            if (userId === KOG) updateData.$push.KOG = newTournament._id;
            if (userId === KOA) updateData.$push.KOA = newTournament._id;

            // בדיקה אם המשתמש הוא אמיתי או פיקטיבי
            const userExists = await User.findById(userId);

            if (userExists) {
                // עדכון משתמש אמיתי במסד הנתונים
                await User.findByIdAndUpdate(userId, updateData);
            } else {
                // עדכון של משתמש פיקטיבי (fakeUser) במסד של הליגה
                const fakeUser = league.fakeUsers.find(fake => fake._id.toString() === userId);
                if (fakeUser) {
                    // עדכון הנתונים הרלוונטיים
                    fakeUser.tournamentsId.push(newTournament._id);
                    if (userId === firstPlace) fakeUser.firstPlaces.push(newTournament._id);
                    if (userId === secondPlace) fakeUser.secondPlaces.push(newTournament._id);
                    if (userId === KOG) fakeUser.KOG.push(newTournament._id);
                    if (userId === KOA) fakeUser.KOA.push(newTournament._id);
                }
            }
        }));

        await league.save(); // שמירה של הליגה לאחר עדכון הפיקטיביים

        return res.status(201).json({
            message: 'משחק נוצר בהצלחה',
            tournament: newTournament,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'שגיאת שרת' });
    }
};


// עריכת משחק קיים
exports.editTournament = async (req, res) => {
    try {
        const { leagueSlug, slug } = req.params;
        const { title, firstPlace, secondPlace, KOG, KOA, usersId } = req.body;

        // בדיקה אם הליגה והמשחק קיימים
        const league = await League.findOne({ slug: leagueSlug });
        if (!league) {
            return res.status(404).json({ error: 'ליגה לא נמצאה' });
        }

        const tournament = await Tournament.findOne({ slug });
        if (!tournament) {
            return res.status(404).json({ error: 'משחק לא נמצא' });
        }

        // עדכון פרטי המשחק
        tournament.title = title;
        tournament.firstPlace = firstPlace;
        tournament.secondPlace = secondPlace;
        tournament.KOG = KOG;
        tournament.KOA = KOA;
        tournament.usersId = usersId;

        await tournament.save();

        return res.status(200).json({
            message: 'משחק עודכן בהצלחה',
            tournament,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'שגיאת שרת' });
    }
};

// מחיקת משחק קיים
exports.deleteTournament = async (req, res) => {
    try {
        const { leagueSlug, slug } = req.params;

        // מציאת הליגה לפי ה-slug
        const league = await League.findOne({ slug: leagueSlug });
        if (!league) {
            return res.status(404).json({ error: 'ליגה לא נמצאה' });
        }

        // מציאת הטורניר ומחיקתו לפי ה-slug
        const tournament = await Tournament.findOneAndDelete({ slug });
        if (!tournament) {
            return res.status(404).json({ error: 'טורניר לא נמצא' });
        }

        // פונקציה להסרת משתמש פעם אחת בלבד ממערך
        const removeUserOnce = (array, userId) => {
            const index = array.findIndex(id => id.toString() === userId.toString());
            if (index !== -1) {
                array.splice(index, 1); // מסיר את המשתמש פעם אחת בלבד
            }
        };

        // הסרת המשתמשים משדות הליגה: firstPlace, secondPlace, KOG (פעם אחת בכל שדה)
        if (tournament.firstPlace) {
            removeUserOnce(league.firstPlaces, tournament.firstPlace);
        }
        if (tournament.secondPlace) {
            removeUserOnce(league.secondPlaces, tournament.secondPlace);
        }
        if (tournament.KOG) {
            removeUserOnce(league.KOG, tournament.KOG);
        }
        if (tournament.KOA) {
            removeUserOnce(league.KOA, tournament.KOA);
        }

        // עדכון fakeUsers בליגה על ידי הסרת הטורניר מהשדות המתאימים
        league.fakeUsers.forEach(fakeUser => {
            if (fakeUser.firstPlaces && fakeUser.firstPlaces.includes(tournament._id)) {
                fakeUser.firstPlaces.pull(tournament._id); // מסיר את הטורניר מהשדה
            }
            if (fakeUser.secondPlaces && fakeUser.secondPlaces.includes(tournament._id)) {
                fakeUser.secondPlaces.pull(tournament._id); // מסיר את הטורניר מהשדה
            }
            if (fakeUser.KOG && fakeUser.KOG.includes(tournament._id)) {
                fakeUser.KOG.pull(tournament._id); // מסיר את הטורניר מהשדה
            }
            if (fakeUser.KOA && fakeUser.KOA.includes(tournament._id)) {
                fakeUser.KOA.pull(tournament._id); // מסיר את הטורניר מהשדה
            }
            if(fakeUser.tournamentsId && fakeUser.tournamentsId.includes(tournament._id)) {
                fakeUser.tournamentsId.pull(tournament._id);
            }
        });

        // הסרת הטורניר מרשימת הטורנירים של הליגה
        league.tournamentsId.pull(tournament._id);
        await league.save();

        // יצירת אובייקט עבור פעולת $pull כדי להסיר את כל הקשרים הקשורים לטורניר אצל המשתמשים
        const updateQuery = {
            tournamentsId: tournament._id
        };

        // הוספת ערכים ל-query רק אם הם קיימים
        if (tournament.firstPlace) {
            updateQuery.firstPlaces = tournament._id;
        }
        if (tournament.secondPlace) {
            updateQuery.secondPlaces = tournament._id;
        }
        if (tournament.KOG) {
            updateQuery.KOG = tournament._id;
        }
        if (tournament.KOA) {
            updateQuery.KOA = tournament._id;
        }
        if (tournament.KOA) {
            updateQuery.KOA = tournament._id;
        }

        // עדכון כל המשתמשים שהשתתפו בטורניר
        await User.updateMany(
            { _id: { $in: tournament.usersId } }, // כל המשתמשים שהשתתפו בטורניר
            { 
                $pull: updateQuery // מחיקת הטורניר, המקומות והערכים המתאימים
            }
        );

        return res.status(200).json({ message: 'הטורניר נמחק בהצלחה והמשתמשים והליגה עודכנו' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'שגיאת שרת' });
    }
};



// קבלת כל המשחקים בליגה
exports.getAllTournaments = async (req, res) => {
    try {
        const { leagueSlug } = req.params;

        // חפש ליגה לפי ה-slug שלה
        const league = await League.findOne({ slug: leagueSlug })
            .populate('tournamentsId'); // השתמש ב-tournamentsId

        if (!league) {
            return res.status(404).json({ error: 'ליגה לא נמצאה' });
        }

        const shuffledTournaments = shuffleArray(league.tournamentsId);

        return res.status(200).json({
            tournaments: shuffledTournaments, // החזר את ה-tournaments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'שגיאת שרת' });
    }
};

// קבלת משחק לפי מזהה
/*exports.getTournamentBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // מציאת המשחק והבאת המידע המלא עבור כל השדות הקשורים למשתמשים
        const tournament = await Tournament.findOne({ slug })
            .populate('usersId') // מביא את כל האובייקטים של המשתמשים ב-usersId
            .populate('firstPlace') // מביא את המידע של המשתמש במקום הראשון
            .populate('secondPlace') // מביא את המידע של המשתמש במקום השני
            .populate('KOG') // מביא את המידע של מלך השערים
            .populate('KOA') // מביא את המידע של מלך הבישולים

        if (!tournament) {
            return res.status(404).json({ error: 'משחק לא נמצא' });
        }

        return res.status(200).json({
            tournament,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'שגיאת שרת' });
    }
};*/

exports.getTournamentBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // שליפת הטורניר כולל פרטי משתמשים רלוונטיים
        const tournament = await Tournament.findOne({ slug })
            .populate({
                path: 'usersId',
                select: '-googleId -password -verify -admin -createdLeague' // אי הצגת השדות הלא רצויים
            })
            .populate({
                path: 'firstPlace',
                select: '-googleId -password -verify -admin -createdLeague' // אי הצגת השדות הלא רצויים
            })
            .populate({
                path: 'secondPlace',
                select: '-googleId -password -verify -admin -createdLeague' // אי הצגת השדות הלא רצויים
            })
            .populate({
                path: 'KOG',
                select: '-googleId -password -verify -admin -createdLeague' // אי הצגת השדות הלא רצויים
            })
            .populate({
                path: 'KOA',
                select: '-googleId -password -verify -admin -createdLeague' // אי הצגת השדות הלא רצויים
            })

        if (!tournament) {
            return res.status(404).json({ error: 'טורניר לא נמצא' });
        }

        // שליפת הליגה עם המשתמשים הפיקטיביים
        const league = await League.findById(tournament.leagueId).populate('fakeUsers');

        if (!league) {
            return res.status(404).json({ error: 'ליגה לא נמצאה' });
        }

        // פונקציה לקבלת משתמש פיקטיבי אם הוא מתאים ל-tournament הנוכחי ושדה המיקום
        const getRealOrFakeUser = (realUser, field) => {
            if (realUser?.email) return realUser; // אם יש אימייל, זה משתמש אמיתי
            
            // חיפוש משתמש פיקטיבי מתאים לפי מזהה טורניר ושדה
            return league.fakeUsers.find(fakeUser => 
                fakeUser._id.equals(realUser?._id) ||
                (Array.isArray(fakeUser[field]) 
                    ? fakeUser[field].some(tournamentId => tournamentId.equals(tournament._id))
                    : fakeUser[field]?.equals(tournament._id))
            ) || realUser;
        };

        const firstPlace = getRealOrFakeUser(tournament.firstPlace, 'firstPlaces');
        const secondPlace = getRealOrFakeUser(tournament.secondPlace, 'secondPlaces');
        const KOG = getRealOrFakeUser(tournament.KOG, 'KOG');
        const KOA = getRealOrFakeUser(tournament.KOA, 'KOA');

        // הגדרת רשימת המשתמשים הכוללת
        const allUsers = [...tournament.usersId, ...league.fakeUsers];

        return res.status(200).json({
            tournament: {
                ...tournament.toObject(),
                users: allUsers,
                firstPlace,
                secondPlace,
                KOG,
                KOA,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'שגיאת שרת' });
    }
};
