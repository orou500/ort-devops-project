const User = require('../models/userModel');
const Tournament = require('../models/tournamentModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const League = require('../models/leagueModel');

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

exports.createLeague = async (req, res) => {
    const { title, slug, usersId, adminsId, createdAt } = req.body;

    const userToken = req.headers.authorization;
    const userId = await jwt.verify(userToken, process.env.JWT_KEY).id;
    const user = await User.findById(userId); // מצאנו כבר את המשתמש

    // בדיקת שדות נדרשים
    if (!title || !usersId || !adminsId || adminsId.length < 1 || usersId.length < 1 ) {
        return res.status(400).json({ error: 'חסרים שדות נדרשים' });
    }

    try {
        // בדוק אם הכותרת בעברית
        let titleUpperCase;
        if (/[\u0590-\u05FF]/.test(title)) {
            // אם הכותרת מכילה תווים בעברית, השאר אותה כפי שהיא
            titleUpperCase = title;
        } else {
            // אם הכותרת אינה בעברית, המר אותה לאותיות גדולות
            titleUpperCase = title.toUpperCase();
        }

        // בדוק אם קיימת ליגה עם אותו שם
        const existingLeague = await League.findOne({ title: titleUpperCase });
        if (existingLeague) {
            return res.status(400).json({ error: 'השם של הליגה כבר תפוסה' });
        }

        if(user.createdLeague) {
            return res.status(400).json({ error: 'משתמש זה לא יכול ליצור ליגה' });
        } else {
            await User.findByIdAndUpdate(userId, { createdLeague: true }, { new: true });
        }

        // יצירת הליגה במסד הנתונים
        const league = await League.create({ title: titleUpperCase, slug, createdBy: userId, usersId, adminsId, createdAt });

        // עדכון כל המשתמשים ב-usersId עם ה-ID של הליגה החדשה
        await Promise.all(usersId.map(userId => {
            return User.findByIdAndUpdate(userId, { $push: { leaguesId: league._id } });
        }));

        // עדכון כל המשתמשים ב-adminsId עם ה-ID של הליגה החדשה
        await Promise.all(adminsId.map(adminId => 
            User.findByIdAndUpdate(adminId, { $push: { adminLeaguesId: league._id } })
        ));

        token = createToken(usersId);
        
        res.status(201).json({ league: league._id, token });
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};


exports.getAllLeagues = async (req, res) => {
    try {
        const leagues = await League.find({}).select('title slug usersId tournamentsId createdAt');

        // עיבוד נתונים שיחזרו רק מה שנדרש
        const formattedLeagues = leagues.map(league => ({
            id: league._id,
            title: league.title,
            slug: league.slug,
            usersCount: league.usersId.length,
            tournamentsCount: league.tournamentsId.length,
            createdAt: league.createdAt
        }));

        // ערבוב הליגות
        const shuffledLeagues = shuffleArray(formattedLeagues);

        res.status(200).json(shuffledLeagues);
    } catch (err) {
        res.status(500).json({ error: 'שגיאה בשליפת הליגות' });
    }
};

exports.getAllUserLeagues = async (req, res) => {
    try {
        const userId = req.params.userId; // מזהה המשתמש שמתקבל מהבקשה
  
      // חיפוש ליגות שבהן המשתמש נמצא
      const userLeagues = await League.find({ usersId: userId });

      const formattedUserLeagues = userLeagues.map(league => ({
        id: league._id,
        title: league.title,
        slug: league.slug,
        adminsId: league.adminsId,
        usersCount: league.usersId.length + league.fakeUsers.length,
        tournamentsCount: league.tournamentsId.length,
        createdAt: league.createdAt,
    }));
  
      if (formattedUserLeagues.length === 0) {
        return res.status(404).json({ message: 'לא נמצאו ליגות עבור המשתמש.' });
      }
  
      // החזרת הליגות שנמצאו
      const shuffledLeagues = shuffleArray(formattedUserLeagues);
      res.status(200).json(shuffledLeagues);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'שגיאה באחזור הליגות עבור המשתמש.' });
    }
  };

  exports.getLeagueBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const userToken = req.headers.authorization;
        const userId = await jwt.verify(userToken, process.env.JWT_KEY).id;

        const league = await League.findOne({ slug: slug });

        // אם הליגה לא נמצאה
        if (!league) {
            return res.status(404).json({ error: 'ליגה לא נמצאה' });
        }

        // שליפת המשתמשים האמיתיים
        const leagueUsers = await User.find({ _id: { $in: league.usersId } })
            .select('firstName lastName email firstPlaces secondPlaces KOG KOA');

        // עדכון מספר המשתמשים הכולל
        const usersCount = league.usersId.length + league.fakeUsers.length;

        // שליפת המשחקים שקשורים לליגה
        const leagueTournaments = await Tournament.find({ leagueId: league._id })
            .select('title slug firstPlace secondPlace KOG KOA createdAt');

        const allUsers = [...leagueUsers, ...league.fakeUsers];

        const formattedLeague = {
            id: league._id,
            title: league.title,
            slug: league.slug,
            adminsId: league.adminsId,
            users: allUsers, // המשתמשים האמיתיים והמדומים יחד
            usersCount: usersCount, // מספר המשתמשים הכולל
            tournaments: leagueTournaments, // המשחקים
            fakeUsers: league.fakeUsers,
            tournamentsCount: league.tournamentsId.length,
            createdAt: league.createdAt,
        };

        const user = await User.findById(userId);

        // בדיקה אם המשתמש נמצא ברשימת השחקנים או המנהלים של הליגה או שהוא מנהל כללי
        const isUserPartOfLeague = league.usersId.includes(userId) || league.adminsId.includes(userId);
        const isAdmin = user && user.admin; // בדיקה אם הוא מנהל כללי

        // אם המשתמש לא חלק מהליגה ולא מנהל כללי
        if (!isUserPartOfLeague && !isAdmin) {
            return res.status(403).json({ error: 'אין לך גישה לליגה זו' });
        }

        const token = createToken(userId);

        // מחזיר את פרטי הליגה, המשחקים, ואת הטוקן
        res.status(200).json({ league: formattedLeague, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'שגיאה בשרת' });
    }
};


// פונקציה לקבלת כל המשתמשים בליגה מסוימת
exports.getLeagueUsers = async (req, res) => {
  const { leagueSlug } = req.params; // שליפת ה-slug של הליגה מה-URL

  try {
    // מציאת הליגה לפי ה-slug
    const league = await League.findOne({ slug: leagueSlug }).populate('usersId');

    if (!league) {
      return res.status(404).json({ message: 'ליגה לא נמצאה' });
    }

    // מציאת כל המשתמשים השייכים לליגה
    const leagueUsers = await User.find({ _id: { $in: league.usersId } }, '-password -admin -updatedAt -firstPlaces -KOG -KOA -leaguesId -tournamentsId -secondPlaces');

    // חיבור משתמשי ה-fakeUsers מהליגה
    const fakeUsers = league.fakeUsers.map(fakeUser => ({
      _id: fakeUser._id || undefined, // ניתן ליצור מזה _id אקראי אם זה נדרש
      firstName: fakeUser.firstName,
      lastName: fakeUser.lastName,
      email: null, // או לא להוסיף את השדה הזה אם לא רוצים
      gender: fakeUser.gender,
      tournamentsId: fakeUser.tournamentsId,
      firstPlaces: fakeUser.firstPlaces,
      secondPlaces: fakeUser.secondPlaces,
      KOG: fakeUser.KOG,
      KOA: fakeUser.KOA,
    }));

    // חיבור המשתמשים האמיתיים עם fakeUsers
    const combinedUsers = [...leagueUsers, ...fakeUsers];

    return res.status(200).json(combinedUsers); // החזרת רשימת המשתמשים (כולל fakeUsers)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'שגיאה בשרת' });
  }
};


exports.addFakeUser = async (req, res) => {
  const { leagueSlug } = req.params; // שליפת ה-slug של הליגה מה-URL

  const fakeUserData = req.body;

  try {
      const league = await League.findOne({ slug: leagueSlug });
      if (!league) {
          return res.status(404).json({ message: 'League not found' });
      }

      // בדוק אם יש משתמש פיקטיבי עם אותו שם ושם משפחה
      const existingFakeUser = league.fakeUsers.find(fakeUser => 
          fakeUser.firstName === fakeUserData.firstName && fakeUser.lastName === fakeUserData.lastName
      );

      if (existingFakeUser) {
          return res.status(400).json({ message: 'Fake user with the same name already exists' });
      }

      // הוסף את המשתמש הפיקטיבי אם הוא לא קיים
      league.fakeUsers.push(fakeUserData);
      await league.save();

      res.status(201).json({ message: 'Fake user added successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to add fake user' });
  }
};

exports.editLeague = async (req, res) => {
  try {
      const leagueSlug = req.params.slug;
      const { title, usersId, adminsId, fakeUsers } = req.body;
      const userToken = req.headers.authorization;
      const userId = await jwt.verify(userToken, process.env.JWT_KEY).id;

      if (!title || !usersId || !adminsId || adminsId.length < 1 || usersId.length < 1) {
          return res.status(400).json({ error: 'חסרים שדות נדרשים' });
      }

      const requesterUser = await User.findById(userId);
      const league = await League.findOne({ slug: leagueSlug });

      if (!league) {
          return res.status(404).json({ error: 'ליגה לא נמצאה' });
      }

      const isAdmin = league.adminsId.includes(userId) || requesterUser.admin;
      if (!isAdmin) {
          return res.status(403).json({ error: 'אין לך הרשאה לערוך ליגה זו' });
      }

      const removedUsers = league.usersId.filter(oldUserId => !usersId.includes(oldUserId.toString()));
      const removedFakeUsers = league.fakeUsers ? league.fakeUsers.filter(oldFakeUser => !fakeUsers.includes(oldFakeUser._id.toString())) : [];

      league.fakeUsers = fakeUsers;
      league.title = title.toUpperCase();
      league.usersId = usersId;
      league.adminsId = adminsId;

      await league.save();

      if (removedUsers.length > 0 || removedFakeUsers.length > 0) {
          // איחוד מזהי המשתמשים המוסרים
          const allRemovedUserIds = [...removedUsers, ...removedFakeUsers].map(user => user._id);

          // מציאת מזהי התחרויות שנמחקו
          const removedTournaments = await Tournament.find({ usersId: { $in: allRemovedUserIds } }).select('_id');
          const removedTournamentIds = removedTournaments.map(tournament => tournament._id);
          // אם יש תחרויות שנמחקו, הסרתן מהליגה
          if (removedTournamentIds.length > 0) {
              const tournaments = await Tournament.find({ _id: { $in: removedTournamentIds } });

              // הוצאת מזהי המשתמשים מהתחרויות
              const userIdsFromTournaments = tournaments.flatMap(tournament => [
                  tournament.firstPlace,
                  tournament.secondPlace,
                  tournament.KOG,
                  tournament.KOA,
              ]).filter(id => id); // רק מזהים לא null

              // מחיקת המידע מהליגה
              await League.updateMany(
                  { 'tournamentsId': { $in: removedTournamentIds } },
                  { 
                      $pull: { 
                          'tournamentsId': { $in: removedTournamentIds },
                          'firstPlaces': { $in: userIdsFromTournaments },
                          'KOG': { $in: userIdsFromTournaments },
                          'KOA': { $in: userIdsFromTournaments },
                          'secondPlaces': { $in: userIdsFromTournaments },
                      } 
                  }
              );

              // עדכון המשתמשים
              await User.updateMany(
                  { _id: { $in: usersId } },
                  { 
                      $pull: { 
                          'tournamentsId': { $in: removedTournamentIds },
                          'firstPlaces': { $in: removedTournamentIds },
                          'secondPlaces': { $in: removedTournamentIds },
                          'KOG': { $in: removedTournamentIds },
                          'KOA': { $in: removedTournamentIds },
                      }
                  }
              );
          }

          // מחיקת התחרויות הקשורות למשתמשים שהוסרו
          await Tournament.deleteMany({ usersId: { $in: allRemovedUserIds } });
      }

      // עדכון המשתמשים החדשים בליגה
      await User.updateMany(
          { _id: { $in: usersId } },
          { $addToSet: { leaguesId: league._id } }
      );

      // הסרת הליגה מהמשתמשים שהוסרו
      if (removedUsers.length > 0) {
          await User.updateMany(
              { _id: { $in: removedUsers } },
              { $pull: { leaguesId: league._id } }
          );
      }

      const token = createToken(userId);
      return res.status(200).json({
          message: 'ליגה עודכנה בהצלחה',
          league,
          token,
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'שגיאת שרת' });
  }
};

  exports.deleteLeague = async (req, res) => {
    try {
        const leagueId = req.params.id;

        // מציאת הליגה והמשתמש שיצר אותה (נמצא ב-createdBy)
        const league = await League.findById(leagueId);
        if (!league) {
            return res.status(404).json({ error: 'League not found' });
        }
        
        const createdByUserId = league.createdBy;

        // עדכון המשתמש שיצר את הליגה - שינוי createdLeague ל-false
        await User.findByIdAndUpdate(createdByUserId, { createdLeague: false });

        // מציאת כל המשתמשים שקשורים לליגה הזו
        const usersWithLeague = await User.find({ leaguesId: leagueId });

        // מציאת כל המשחקים שקשורים לליגה
        const tournaments = await Tournament.find({ leagueId });

        if (usersWithLeague.length > 0) {
            // עדכון כל המשתמשים שמחקנו להם את ה-League והמשחקים
            await Promise.all(
                usersWithLeague.map(async (user) => {
                    const tournamentsToRemove = tournaments.map(tournament => tournament._id.toString());

                    // עדכון המשתמשים ע"י הסרת הליגה והמשחקים
                    await User.updateOne(
                        { _id: user._id },
                        {
                            $pull: { 
                                leaguesId: leagueId,                // הסרת הליגה
                                tournamentsId: { $in: tournamentsToRemove }, // הסרת המשחקים
                                firstPlaces: { $in: tournamentsToRemove }, // הסרת firstPlaces
                                secondPlaces: { $in: tournamentsToRemove }, // הסרת secondPlaces
                                KOG: { $in: tournamentsToRemove }, // הסרת KOG
                                KOA: { $in: tournamentsToRemove }, // הסרת KOA
                            }
                        }
                    );
                })
            );
        }

        // מחיקת כל המשחקים שקשורים לליגה
        await Tournament.deleteMany({ leagueId });

        // מחיקת הליגה מה-DB
        await League.findByIdAndDelete(leagueId);

        res.status(200).json({ message: 'League, tournaments, and related user data updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete league, tournaments, and update users' });
    }
};




