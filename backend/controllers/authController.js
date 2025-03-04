const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');

const maxAge = 15 * 60
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_KEY, {
        expiresIn: maxAge,
    })
}

// התחברות עם Google
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// טיפול בתוצאה מהאימות של Google והפניית המשתמש עם הטוקן
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'אימות נכשל' });
    }

    const token = createToken(user._id);
    const redirectUri = req.query.redirect_uri || process.env.APP_URL_PROD; // ברירת מחדל במקרה שאין הפניה
    res.redirect(`${redirectUri}?token=${token}`);
  })(req, res, next);
};

// קבלת פרטי המשתמש המחובר
exports.getAuthenticatedUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};

exports.createUser = async (req, res) => {
    const { email, password, firstName, lastName, webSite, protocol } = req.body

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'חסרים שדות נדרשים' });
    }

    try{

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,  // כתובת ה-Gmail שלך
                pass: process.env.MAIL_PASS,  // סיסמת האפליקציה שיצרת
            },
        });
        
        const user = await User.create({ email: email.toLowerCase(), password, firstName, lastName })
        const htmlMail = `
        <html>
          <head>
            <style>
              body {
                direction: rtl;
                font-family: Arial, sans-serif;
              }
              h1, h3 {
                direction: rtl;
                text-align: right;
              }
            </style>
          </head>
          <body>
            <h1>שלום ${firstName}, אנא אשר את המשתמש שלך.</h1>
            <h3>
              קישור: 
              <a href="${protocol}//${webSite}/user/verify/${user.id}">
                ${protocol}//${webSite}/user/verify/${user.id}
              </a>
            </h3>
          </body>
        </html>
      `;
        const TheMail = await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: `שלום ${firstName}, אנא אשר את המשתמש שלך.`,
            html: htmlMail,
          });

          return res.status(201).json({user})

    } catch (err) {
        console.log(err)
        return res.status(400).json(err)
    }
};

exports.verifyUser = async (req, res) => {
    const { id } = req.params;
    try {
        // חיפוש המשתמש לפי ID
        const user = await User.findById(id, '-password');

        if (!user) {
            return res.status(404).json({ message: 'משתמש לא נמצא' });
        }

        // בדיקה אם המשתמש כבר מאומת
        if (user.verify) {
            return res.status(400).json({ message: 'המשתמש כבר מאומת' });
        }

        // עדכון שדה ה-verify ל-true
        await User.findByIdAndUpdate(id, { verify: true }, { new: true });

        // יצירת token למשתמש
        const token = createToken(user._id);

        // שליחת תגובה ללקוח עם המידע של המשתמש ו-token
        return res.status(201).json({ user, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'שגיאה בשרת, אנא נסה שוב מאוחר יותר' });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({email: email.toLowerCase()});

        if(user.length === 0 || user.length > 1){
            return res.status(401);
        }

        if(!user.verify) {
            return res.status(201).json({ message: 'נדרש לאמת את המשתמש במייל' });
        }

        bcrypt.compare(password, user.password, (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'Internal server error' });
            }
            
            if (result) {
                const token = createToken(user._id);
                // שליחת טוקן גישה
                return res.status(201).json({ user, token });
            } else {
                return res.status(401).json({ message: 'Invalid email or password' });; // סיסמה שגויה
            }
        });

    } catch (error) {
        return res.status(500).send(error);
    }
};

// קבלת פרטי המשתמש לפי ID בטוקן
exports.getUserProfileGoogle = async (req, res) => {
    try {
      const token = req.headers['authorization'] || req.body.headers.Authorization;
      const userId = await jwt.verify(token, process.env.JWT_KEY).id
      const user = await User.findById(userId, '-password');
  
      if (!user) {
        return res.status(404).json({ message: 'משתמש לא נמצא' });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'שגיאה בשרת' });
    }
  };
  

exports.getAllUsers = async (req, res) => {
    try {
      // חיפוש כל המשתמשים בלי השדות password ו-admin
      const users = await User.find({}, '-password -admin -updatedAt');
  
      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found' });
      }
  
      return res.status(200).json(users);
    } catch (error) {
      // טיפול בשגיאות
      return res.status(500).json({ message: 'Internal server error', error });
    }
  };

exports.verifyTokenUser = async (req, res) => {
  const token = req.headers['authorization'] || req.body.headers.Authorization; ; // מחלץ את הטוקן מהכותרת
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' }); // מוסיפים return כדי לעצור את הביצוע
  }

  try {
    // בדיקת הטוקן ואימות המידע
    const userId = await jwt.verify(token, process.env.JWT_KEY).id

    // מציאת המשתמש על בסיס ה-ID מהטוקן
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // מוסיפים return
    }
    const newToken = createToken(user._id);
    // החזרת מידע המשתמש
    return res.json({
      token: newToken,
      user: {
        _id: user._id,
        verify: user.verify,
        email: user.email,
        admin: user.admin,
        createdLeague: user.createdLeague,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        leaguesId: user.leaguesId,
        tournamentsId: user.tournamentsId,
        firstPlaces: user.firstPlaces,
        secondPlaces: user.secondPlaces,
        KOG: user.KOG,
        KOA: user.KOA
      }
    });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' }); // גם כאן return
  }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const userToken = req.headers.authorization;

        const decodedToken = await jwt.verify(userToken, process.env.JWT_KEY);
        const requesterId = decodedToken.id;

        if (requesterId === userId) {
            return res.status(403).json({ error: 'משתמש לא נמצא' });
          }

        // שליפת פרטי המשתמש על פי userId, ומסנן רק את השדות הרצויים
        const user = await User.findById(userId).select('profileImage dateOfBirth firstName lastName email gender firstPlaces secondPlaces KOG KOA');
        // אם המשתמש לא נמצא
        if (!user) {
          return res.status(404).json({ error: 'משתמש לא נמצא' });
        }
        // מחזיר את הפרטים הנדרשים של המשתמש
        return res.status(200).json(user);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'שגיאה בשרת' });
      }
  };

  exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });

        // יצירת טוקן חדש רק אם יש צורך
        const token = createToken(user._id);

        // שליחת המשתמש המעודכן וה-token החדש בתגובה
        res.status(200).json({
            user,
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'עדכון משתמש נכשל' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email, protocol, webSite } = req.body;

    try {
        // בדוק אם המשתמש קיים במערכת
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'משתמש לא נמצא' });
        }

        // צור טוקן לאיפוס סיסמה
        const resetToken = createToken(user._id);

        // שלח מייל עם הטוקן
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,  // כתובת ה-Gmail שלך
                pass: process.env.MAIL_PASS,  // סיסמת האפליקציה שיצרת
            },
        });
        
        const htmlMail = `
        <html>
        <head>
        <style>
        body {
            direction: rtl;
            font-family: Arial, sans-serif;
            }
            h1, h3 {
                direction: rtl;
                text-align: right;
                }
                </style>
                </head>
                <body>
                <h1>שלום ${user.firstName}, הינה קישור לאיפוס סיסמתך.</h1>
                <h3>
                הקישור יהיה זמין ל15 דקות, קישור:
                <a href="${protocol}//${webSite}/reset-password/${resetToken}">
                ${protocol}//${webSite}/reset-password/${resetToken}
                </a>
                </h3>
                </body>
                </html>
                `;
                const TheMail = await transporter.sendMail({
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: `שלום ${user.firstName}, התקבלה בקשה לשינוי סיסמתך`,
                    html: htmlMail,
                });
                
        res.status(200).json({ message: 'מייל לאיפוס סיסמה נשלח בהצלחה' });

    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'שגיאה בשליחת האימייל' });
    }
};

exports.resetPassword = async (req, res) => {
    const resetToken = req.params.token;
    const hashedToken = await jwt.verify(resetToken, process.env.JWT_KEY);

    try {
        // מצא משתמש לפי טוקן ותוקף
        const user = await User.findById(hashedToken.id);

        if (!user) {
            return res.status(400).json({ error: 'טוקן לא חוקי או שפג תוקף' });
        }

        // עדכן את הסיסמה
        user.password = req.body.password;
        await user.save();

        res.status(200).json({ message: 'הסיסמה עודכנה בהצלחה' });
    } catch (err) {
        res.status(500).json({ error: 'שגיאה באיפוס הסיסמה' });
    }
};

module.exports.sendMailContact_post = async (req, res) => {

    const { fullName, Mail, PhoneNumber, FromWeb, ToMail } = req.body

    // if(FromWeb != 'sizops.co.il'){
    //     return res.status(400).json({error: "some error"})
    // }

    var newToMail = process.env.MAIL_USER2;
    var newMail = process.env.MAIL_USER2;

    if(ToMail){
        newToMail = ToMail;
    }
    if(Mail){
        newMail = Mail;
    }

    const htmlMailToMe = `
    <h1>${fullName} - פנה אלינו דרך האתר ${FromWeb}</h1>
    <h3>מספר פלאפון: ${PhoneNumber}</h3>
    <h3>מייל: ${newMail}</h3>
    `
    const htmlMail = `
    <h1>${fullName} תודה שפנית לאתר שלנו ${FromWeb}</h1>
    <h3>הצוות שלנו יצור איתך קשר בהקדם</h3>
    <h3>קיבלת מתנה מאיתנו סרטון הדרכה (12 דקות פרקטיות) שיסבירו לך בדיוק למה לקנות דירה להשקעה ולא למגורים</h3>
    <a href="https://www.youtube.com/watch?v=pVp8mzGl9Lc">https://www.youtube.com/watch?v=pVp8mzGl9Lc</a>
    `
    try{

        if(fullName && PhoneNumber){
            //const newContactUser = await contactUser.create({ fullName, phoneNumber: PhoneNumber.toString()})
            //const client = require('twilio')( process.env.TWILIO_ACCOUNTSID, process.env.TWILIO_AUTHTOKEN);
            //var sendURL = `https://${FromWeb}/contactuser/${newContactUser.id}/`;

            // if(FromWeb == 'localhost'){
            //     sendURL = `http://${FromWeb}:3000/contactuser/${newContactUser.id}/`;
            // }
    
            // client.messages
            //     .create({
            //         body: `
            //             שלום ${fullName},\nכדי לאמת את זהותך אנא לחץ על הקישור הבא:\n\n${sendURL}
            //         `,
            //         from: 'whatsapp:+14155238886',
            //         to: 'whatsapp:+15878022513',
            //     })

                  transporter = nodemailer.createTransport({
                     host: 'mail.sizops.co.il',
                     port: 587,
                     secure: false,
                     tls: { rejectUnauthorized: false },
                     auth: {
                       user: newToMail,
                       pass: process.env.MAIL_PASS2,
                     },
                   });
                  
                   await transporter.sendMail({
                     from: newToMail,
                     to: newToMail,
                     subject: `${fullName} - פנה אלינו דרך האתר`,
                     html: htmlMailToMe,
                   });
                   
                   if(FromWeb == 'smartstepgroup.co.il'){
                       await transporter.sendMail({
                        from: newToMail,
                        to: newMail,
                        subject: `${fullName} תודה שפנית לאתר שלנו ${FromWeb}`,
                        html: htmlMail,
                      });
                   }
              
                  return res.status(201).json('Mail Send!')
        }
        

    } catch (err) {
        console.log(err)
        return res.status(400).json({ err })
    }
}

module.exports.sendMessageToEmail = async (req, res) => {
    const { message, senderEmail } = req.body;

    // ודא שקיימים פרמטרים חיוניים
    if (!message || !senderEmail) {
        return res.status(400).json({ error: "Missing message or senderEmail" });
    }

    // כתובת המייל שלך
    const yourEmail = process.env.MAIL_USER2;

    // הגדרת הטרנספורטר של Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'mail.sizops.co.il',
      port: 587,
      secure: false,
      tls: { rejectUnauthorized: false },
      auth: {
        user: yourEmail,
        pass: process.env.MAIL_PASS2,
      },
    });

    const emailContent = `
        <h1>הודעה חדשה מהוואטסאפ</h1>
        <p><strong>מייל שולח:</strong> ${senderEmail}</p>
        <p><strong>תוכן ההודעה:</strong></p>
        <p>${message}</p>
    `;

    try {
        // שליחת המייל
        await transporter.sendMail({
            from: yourEmail,
            to: yourEmail,
            subject: "הודעה חדשה מהוואטסאפ",
            html: emailContent,
        });

        return res.status(200).json({ message: "Mail sent successfully!" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to send email", details: err.message });
    }
};
