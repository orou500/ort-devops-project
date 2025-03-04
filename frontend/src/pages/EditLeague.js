import React, { useEffect, useState } from 'react';
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
import { useParams } from 'react-router-dom';
import InfoTooltip from '../components/InfoTooltip';

const EditLeague = () => {
  const { slug } = useParams(); // מקבל את מזהה הליגה מה-URL
  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

  const { auth } = useAuth();
  const { addToast } = useToast();
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [fakeUsers, setFakeUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [leagueTitle, setLeagueTitle] = useState('');
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchLeagueDetails = async () => {
      setIsLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/leagues/${slug}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          }
        });
        const { title, users, adminsId, fakeUsers } = response.data.league;
        setLeagueTitle(title); // ממלא את שם הליגה ב-Input
        setUsers(users); // שומר את השילוב ב-users
        setFakeUsers(fakeUsers); // שומר את fakeUsers בנפרד
        setAdminUsers(adminsId); // ממלא את רשימת המנהלים
      } catch (err) {
        setError('שגיאה באחזור פרטי הליגה');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeagueDetails();
  }, [slug, addToast]);

  const handleReset = (toAddToast) => {
    if (toAddToast !== false) {
      toAddToast = true;
    }
    setUsers([]);
    setAdminUsers([]);
    setLeagueTitle(''); // מנקה גם את שדה הכותרת
    setResults([]); // מנקה את תוצאות החיפוש
    if (toAddToast) {
      addToast({ id: Date.now(), message: 'נתוני הליגה נמחקו', type: 'error' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (leagueTitle.length < 6 || leagueTitle.length > 50) {
      addToast({ id: Date.now(), message: 'הכותרת חייבת להיות בין 6 ל-50 תווים.', type: 'error' });
      return;
    }

    if (adminUsers.length === 0) {
        addToast({ id: Date.now(), message: 'יש לבחור לפחות מנהל אחד', type: 'error' });
        return;
    }

    try {
      setIsLoading2(true);
      const token = localStorage.getItem('token');

      // ניצור מערך של מזהים עבור משתמשים אמיתיים בלבד
      const realUsersIds = users
        .filter(user => !fakeUsers.some(fakeUser => fakeUser._id === user._id))
        .map(user => user._id);
      
      // ניצור מערך של מזהים עבור המשתמשים הפיקטיביים שעדיין קיימים ב-fakeUsers
      const newFakeUsers = fakeUsers
        .filter(fakeUser => users.some(user => user._id === fakeUser._id)) // רק אלו שלא נמחקו

      const response = await axios.put(`/leagues/${slug}`, {
        title: leagueTitle.toUpperCase(),
        usersId: realUsersIds,
        adminsId: adminUsers,
        fakeUsers: newFakeUsers
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        }
      });

      if (response.data) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        localStorage.removeItem('token');
        localStorage.setItem('token', response.data.token);
        setIsLoading2(false);
        addToast({ id: Date.now(), message: 'הליגה עודכנה בהצלחה!', type: 'success' });
        handleReset(false);
      }
    } catch (err) {
      setIsLoading2(false);
      if (err.response) {
        addToast({ id: Date.now(), message: err.response.data.errors || 'שגיאה בעדכון ליגה', type: 'error' });
      } else {
        addToast({ id: Date.now(), message: 'שגיאה לא ידועה', type: 'error' });
      }
    } finally {
      setIsLoading2(false); 
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
          <h1 className='league-title'>עריכת ליגה:</h1>
          <hr className="sep" />
          {error && <p>{error}</p>}
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
          <UsersList users={users} setUsers={setUsers} adminUsers={adminUsers} setAdminUsers={setAdminUsers} />
          <div className="search-bar-container">
            <InfoTooltip message="חיפוש משתמשים על ידי המייל שלהם. שים לב שחובה להוסיף לפחות משתמש 1." />
            <SearchBar setResults={setResults} auth={auth} setIsLoading={setIsLoading} />
            {isLoading ? (
              <div className="loading">טוען נתונים...</div>
            ) : (
              results && results.length > 0 && <SearchResultsList results={results} users={users} setUsers={setUsers} isLoading={isLoading} />
            )}
          </div>
          {
            isLoading2 ? (
              <div className="btn-box">
                <PulseLoader className="contact-loading" color="var(--primary-text-color)" />
              </div>
            ) : (
              <div className="btn-box">
                <button className="btn btn-submit" type="submit">שמור</button>
                <button className="btn btn-cancel" type="button" onClick={handleReset}>אפס</button>
              </div>
            )
          }
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditLeague;
