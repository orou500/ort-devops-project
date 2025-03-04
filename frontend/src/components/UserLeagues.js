import React, { useEffect, useState } from 'react';
import axios from '../api/axios'; // ודא שהנתיב נכון
import { useAuth } from '../hooks/useAuth'; // ודא שהנתיב נכון
import { LeagueCard } from './LeagueCard';
import { PulseLoader } from 'react-spinners';
import Pagination from './Pagination';
import { Link } from 'react-router-dom';

const UserLeagues = () => {
  const { auth } = useAuth(); // לוקח את פרטי המשתמש
  const [leagues, setLeagues] = useState([]); // מצב לשמירת הליגות
  const [loading, setLoading] = useState(true); // מצב טעינה
  const [error, setError] = useState(null); // מצב שגיאה
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(2);

  useEffect(() => {
    const fetchUserLeagues = async () => {
      const token = localStorage.getItem('token');
      try {
        await axios.get(`/users/${auth.id}/leagues`, {
          headers: {
              'Content-Type': 'application/json',
              'Authorization' : `${token}`,
            },
      }).then((res) => {
        setPostsPerPage(2)
        setLeagues(res.data); // עדכון מצב הליגות
      })
      } catch (err) {
        setError('שגיאה בעת אחזור הליגות'); // טיפול בשגיאות
      } finally {
        setLoading(false); // סיום מצב הטעינה
      }
    };

    fetchUserLeagues(); // קריאה לפונקציה
  }, [auth]); // התלות היא במזהה המשתמש

  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
var currentLeagues = [];

if(leagues){
  currentLeagues = leagues.slice(firstPostIndex, lastPostIndex);
}

  if (loading) return <PulseLoader className="contact-loading" color="var(--primary-text-color)" />; // הצגת הודעה בזמן טעינה
  if (error) return <Link className="button-modern" to='/createleague'>יצירת ליגה</Link>; // הצגת שגיאה אם קיימת

  return (
    <div>
      <h2>הליגות שלי:</h2>
      {leagues.length === 0 ? (
        <Link className="button-modern" to='/createleague'>
          יצירת ליגה
        </Link> // הודעה אם אין ליגות
      ) : (
        <div className='users-leagues-continer'>
          {currentLeagues.map((league, i) => ( // מציג את שתי הליגות הראשונות
            <LeagueCard league={league} currentLeagues={currentLeagues} key={i} leagues={leagues} setLeagues={setLeagues}/>
          ))}
        </div>
      )}{
        leagues.length > postsPerPage ? 
        <Pagination
          totalPosts={leagues.length}
          postsPerPage={postsPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        /> :
        <></>
      }
      <div>
      </div>
    </div>
  );
};

export default UserLeagues; // ייצוא נכון
