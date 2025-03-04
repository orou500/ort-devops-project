import React, { useState } from 'react';
import '../style/CreateLeague.css';
import useLocalStorage from 'use-local-storage';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { Footer } from '../components/Footer';
import { SearchBar } from '../components/SearchBar';
import { SearchResultsList } from '../components/SearchResultsList';
import { UsersList } from '../components/UsersList';
import { useToast } from '../context/ToastContext';
import axios from '../api/axios';
import { PulseLoader } from 'react-spinners';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import InfoTooltip from '../components/InfoTooltip';

const CreateLeague = () => {
  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

  const { auth } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [leagueTitle, setLeagueTitle] = useState('');
  const [leagueDate, setLeagueDate] = useState(''); // מצב לניהול התאריך שנבחר

    // הפונקציה מחזירה את התאריך הנוכחי בפורמט YYYY-MM-DD
    const getCurrentDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

  /*const handleSubmit = (event) => {
    event.preventDefault(); // למנוע את ברירת המחדל של שליחת הטופס
    // כאן תוסיף את הלוגיקה לשליחת הנתונים לשרת
    console.log('ליגה נשלחה:', { leagueTitle, users, adminUsers });
  };*/

  const handleReset = (toAddToast) => {
    if(toAddToast !== false) {
      toAddToast = true
    }
    setUsers([]);
    setAdminUsers([]);
    setLeagueTitle(''); // מנקה גם את שדה הכותרת
    setLeagueDate(''); // מנקה את התאריך שנבחר
    setResults([]); // מנקה את תוצאות החיפוש
    setLeagueDate(''); // מנקה את התאריך שנבחר
    if(toAddToast){
      addToast({ id: Date.now(), message: 'נתוני הליגה נמחקו', type: 'error' });
    }
    
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // למנוע את ברירת המחדל של שליחת הטופס

    if (leagueTitle.length < 6 || leagueTitle.length > 50) {
      addToast({ id: Date.now(), message: 'הכותרת חייבת להיות בין 6 ל-50 תווים.', type: 'error' });
      return; // מחזיר את הפונקציה אם הבדיקה לא עברה
    }

    try {
        setIsLoading2(true); // מפעיל את מצב הטעינה
        const token = localStorage.getItem('token');
        const response = await axios.post('/league', {
            title: leagueTitle.toUpperCase(), // שינוי כאן ל-title
            usersId: users.map(user => user._id), // הנח שאתה צריך רק את ה-ID של המשתמשים
            adminsId: adminUsers, // הנח שאתה צריך רק את ה-ID של המנהלים
            createdAt: leagueDate || undefined, // שליחת תאריך יצירת הליגה או השארת השדה ריק
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`, // אם יש צורך ב-Bearer token
            }
        });
        if (response.data) {
            // אם הכל בסדר, הוסף טוסט להצלחה
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            localStorage.removeItem('token')
            localStorage.setItem('token', response.data.token);
            setIsLoading2(false);
            addToast({ id: Date.now(), message: 'הליגה נוצרה בהצלחה!', type: 'success' });
            navigate(`/`);
        }
    } catch (err) {
        setIsLoading2(false); // מסיים את מצב הטעינה במקרה של שגיאה
        if (err.response) {
            // אם יש שגיאה, הוסף טוסט עם הודעת השגיאה
            addToast({ id: Date.now(), message: err.response.data.errors || 'שגיאה ביצירת ליגה', type: 'error' });
        } else {
            addToast({ id: Date.now(), message: 'שגיאה לא ידועה', type: 'error' });
        }
    } finally {
        setIsLoading2(false); // מסיים את מצב הטעינה גם אם הייתה שגיאה
    }
  };


  return (
    <div className='create-league' data-theme={isDark ? "dark" : "light"}>
      <Logo 
        isChecked={isDark}
        handleChange={() => setIsDark(!isDark)}
        auth={auth}
      />
      <div className='create-league-body'>
        <form className='league-form' onSubmit={handleSubmit}>
          <h1 className='league-title'><InfoTooltip message="שים לב ניתן ליצור רק ליגה אחת לכל משתמש." /> יצירת ליגה חדשה:</h1>
          <hr className="sep" />
          <div className='group-info'>
            <InfoTooltip message="הכותרת חייבת להיות בין 6 ל-50 תווים." />
            <div className="group">
              <input 
                type="text" 
                required="required" 
                value={leagueTitle} 
                onChange={(e) => setLeagueTitle(e.target.value)} // מעדכן את שדה הכותרת
              />
              <span className="highlight"></span>
              <span className="bar"></span>
              <label className='league-label'>כותרת</label>
            </div>
          </div>
          <div className='group-info'>
            <InfoTooltip message="התאריך שבו נוצר הליגה או התאריך של הטורניר הראשון." />
            <div className="group">
              <input
                type="date"
                max={getCurrentDate()} // קובע את התאריך הנוכחי כמקסימום האפשרי
                value={leagueDate}
                onChange={(e) => setLeagueDate(e.target.value)} // מעדכן את התאריך
              />
              <span className="highlight"></span>
              <span className="bar"></span>
              <label className='league-label'>תאריך יצירת ליגה</label>
            </div>
          </div>
          <UsersList users={users} setUsers={setUsers} adminUsers={adminUsers} setAdminUsers={setAdminUsers}/>
          <div className="search-bar-container">
            <InfoTooltip message="חיפוש משתמשים על ידי המייל שלהם. שים לב שחובה להוסיף לפחות משתמש 1." />
            <SearchBar setResults={setResults} auth={auth} setIsLoading={setIsLoading} searchInLeague={false}/>
            {isLoading ? (
              <div className="loading">טוען נתונים...</div>
            ) : (
              results && results.length > 0 && <SearchResultsList results={results} users={users} setUsers={setUsers} isLoading={isLoading} />
            )}
          </div>
          {
            isLoading2 ? (
              <div className="btn-box">
                <PulseLoader className="contact-loading" color="var(--primary-text-color)"/>
              </div>
            ) : (

              <div className="btn-box">
                <button className="btn btn-submit" type="submit">שלח</button>
                <button className="btn btn-cancel" type="button" onClick={handleReset}>מחק</button>
              </div>
            )
          }
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default CreateLeague;
