import React, { useEffect, useState } from 'react';
import '../style/LeagueDetailsPage.css';
import { Link, useParams } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import useLocalStorage from 'use-local-storage';
import { Footer } from '../components/Footer';
import Loding from './Loding';
import NotFound from './NotFound';
import UsersListComponents from '../components/UsersListComponents';
import LeagueTournamentsList from '../components/LeagueTournamentsList';
import LeagueLeaderboard from '../components/LeagueLeaderboard';
import { AnimatedCounter } from 'react-animated-counter';
import InfoTooltip from '../components/InfoTooltip';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const LeagueDetailsPage = () => {
  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

  const { slug } = useParams();
  const { auth } = useAuth();
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersLength, setUsersLength] = useState(0)
  const [error, setError] = useState(null);
  const [isLeagueAdmin, setIsLeagueAdmin] = useState(false); // משתנה לבדוק אם המשתמש הוא מנהל הליגה
  const [tournamentType, setTournamentType] = useState('tournament1'); // state לבחירת סוג הטורניר

  const startGuide = () => {
    const steps = [
      {
        popover: {
          title: 'דף הליגה',
          description: 'בדף הליגה ניתן לראות את כל נתוני הליגה.',
          side: "top", align: 'center',
        },
      },
      isLeagueAdmin ? {
        element: '.league-admin',
        popover: {
          title: 'ממשק מנהל',
          description: 'כאן ניתן להוסיף טורנירים ולערוך טורנירים בסגנונות מסוימים.',
          side: "bottom", align: 'center',
        },
      } : null,
      isLeagueAdmin ? {
        element: '.tournament-select',
        popover: {
          title: 'אפשרות הבחירת סוג טורניר',
          description: 'אפשרות הבחירה מאפשרת לך לבחור איזה סוג טורניר תרצה להוסיף.',
          side: "bottom", align: 'center',
        },
      } : null,
      isLeagueAdmin ? {
        element: '.createfakeuser',
        popover: {
          title: 'הוספת משתמש מזויף',
          description: 'דף להוספת משתמש מזויף שהוא לא משתמש רשום למערכת ואינו יכול להירשם למערכת.',
          side: "bottom", align: 'center',
        },
      } : null,
      {
        element: '.league-stats',
        popover: {
          title: 'נתוני ליגה',
          description: 'כאן ניתן לראות את נתוני הליגה.',
          side: "top", align: 'center',
        },
      },
      {
        element: '.leaderboard-container',
        popover: {
          title: 'טבלת הליגה',
          description: 'כאן ניתן לראות את תוצאות המשתמשים בליגה.',
          side: "top", align: 'center',
        },
      },
      {
        element: '.league-users',
        popover: {
          title: 'רשימת משתמשים',
          description: 'כאן ניתן לראות את רשימת המשתמשים בליגה בלחיצה על אחד המשתמשים תגיע לפרופיל המשתמש.',
          side: "top", align: 'center',
        },
      },
      {
        element: '.league-tournaments',
        popover: {
          title: 'רשימת טורנירים',
          description: 'כאן ניתן לראות את רשימת הטורנירים בליגה בלחיצה על אחד הטורנירים תגיע לדף הטורניר.',
          side: "top", align: 'center',
        },
      },
    ].filter(step => step !== null); // סינון שלבים ריקים או לא רלוונטיים
  
    const driverObj = driver({
      showProgress: true,
      doneBtnText: 'סיום',
      closeBtnText: 'סגור',
      nextBtnText: 'הבא',
      prevBtnText: 'הקודם',
      steps: steps
    });
    
    driverObj.drive();
  };
  

  useEffect(() => {
    const fetchLeagueDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`/leagues/${slug}`, {
          id: slug,
          user: auth,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `${token}`,
          }
      });
      if(response.data){
        const token = response.data.token;
        localStorage.setItem('token', token);
        setLeague(response.data.league);
      }
      } catch (err) {
        setError('שגיאה באחזור פרטי הליגה');
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueDetails();
  }, [slug, auth]);

   useEffect(() => {
    if(league){
      setUsersLength(league.users.length)
      if (auth.admin || league.adminsId.includes(auth.id)) {
        setIsLeagueAdmin(true); // המשתמש הוא מנהל כללי או מנהל הליגה
      }
    }
  }, [league, auth]);


  if (loading) return <Loding />;
  if (error) return <NotFound />

  if (!league) return <div>ליגה לא נמצאה</div>;

  return (
    <div className='league-details-page' data-theme={isDark ? "dark" : "light"}>
      <Logo 
        isChecked={isDark}
        handleChange={() => setIsDark(!isDark)}
        auth={auth}
      />
      <div className='league-details-body'>
        <div className="league-details">
          <div className='league-header '>
            <h1>{league.title}</h1>
            <div className='btn-box'>
              <button className="button-modern" onClick={startGuide}>
                מדריך אישי
              </button>
            </div>
            {isLeagueAdmin && (
              <div className='btn-box league-admin'>
                <Link to={`/edit/leagues/${slug}`}>
                  <button className='btn btn-cancel'>עריכה</button>
                </Link>
                <Link className='createfakeuser' to={`/${slug}/createfakeuser`}>
                  <button className='btn btn-submit'>הוספת משתמש מדומה</button>
                </Link>

                <Link to={`/${slug}/${tournamentType === 'tournament1' ? 'createtournament' : 'createknockoutbracket'}`}>
                  <button className='btn btn-submit'>{tournamentType === 'tournament1' ? 'הוסף טורניר' : 'הוסף טורניר נוקאאוט'}</button>
                </Link>
                <div>
                  <select
                    value={tournamentType}
                    onChange={(e) => setTournamentType(e.target.value)}
                    className="tournament-select"
                  >
                    <option value="tournament1">הוסף טורניר</option>
                    <option value="tournament2">הוסף טורניר נוקאאוט</option>
                  </select>
                  <InfoTooltip message="שים לב טורניר נוקאאוט מציג בפניך את מפת הטורניר (מי נגד מי)." />
                </div>
              </div>
            )}
          </div>
          <div  className="league-stats">
            <div className="stat-box">
              <span className="stat-number"><AnimatedCounter value={league.tournamentsCount} includeDecimals={false}/></span>
              <span className="stat-label">משחקים</span>
            </div>
            <div className="stat-box">
              <span className="stat-number"><AnimatedCounter className="stat-number" value={league.usersCount} includeDecimals={false}/></span>
              <span className="stat-label">שחקנים</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{new Date(league.createdAt).toLocaleDateString()}</span>
              <span className="stat-label">תאריך יצירה</span>
            </div>
          </div>
          <LeagueLeaderboard users={league.users} postsPerPageNumber={3} totalUsers={usersLength}/>
          <UsersListComponents users={league.users} postsPerPageNumber={3} totalUsers={usersLength} />
          <LeagueTournamentsList tournaments={league.tournaments} postsPerPageNumber={3} totalTournaments={league.tournaments.length} leagueSlug={slug} league={league} setLeague={setLeague} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LeagueDetailsPage;
