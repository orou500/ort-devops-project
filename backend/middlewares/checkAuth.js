const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const checkAuth = async (req, res, next) => {
    try {
        // קבלת הטוקן מהכותרת או מהגוף (אם קיים)
        const token = req.headers['authorization'] || 
                      (req.body && req.body.headers && req.body.headers.Authorization);

        // בדיקה אם הטוקן חסר
        if (!token) {
            return res.status(401).json({ error: 'Authorization token is missing' });
        }

        // אימות הטוקן ושליפת ה-ID של המשתמש
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        const userId = decoded.id;

        // בדיקת קיום המשתמש במסד הנתונים
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // הוספת המשתמש ל-request והמשך ל-middlewares הבאים
        req.user = user;
        next();

    } catch (err) {
        console.error('Authorization error:', err.message);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const checkIfAdmin = async (req, res, next) => {
    const token = req.headers['authorization'] || req.body.headers.Authorization;
    try{
        const userId = await jwt.verify(token, process.env.JWT_KEY).id
        
        await User.findById( userId ).then((user) => {
            if(user.admin){
                next()
            } else {
                return res.status(401).json({message: 'You dont have access'})
            }
        })
    } catch (err) {
        console.log(err)
        res.status(401).json(err)
      }
}

module.exports = { checkAuth, checkIfAdmin };