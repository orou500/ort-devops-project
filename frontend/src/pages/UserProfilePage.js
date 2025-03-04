import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import '../style/UserProfilePage.css';
import Loding from './Loding';
import NotFound from './NotFound';
import useLocalStorage from 'use-local-storage';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { useAuth } from '../hooks/useAuth';
import { LuMedal, LuTrophy } from 'react-icons/lu';
import { PiSoccerBallDuotone } from 'react-icons/pi';
import { AnimatedCounter } from 'react-animated-counter';
import { GiRunningShoe } from 'react-icons/gi';

const UserProfilePage = () => {
  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
  const { auth } = useAuth();

      // פונקציה לחישוב הגיל מתוך תאריך הלידה
    const calculateAge = (dateOfBirth) => {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token'); // לוודא שיש טוקן לאימות
        const response = await axios.get(`/users/${userId}`, {
          headers: {
            'Authorization': `${token}`, // לשלוח את הטוקן בכותרת
            'Content-Type': 'application/json',
          }
        });
        
        setUser(response.data); // שמירת פרטי המשתמש ב-state
      } catch (err) {
        setError('שגיאה באחזור פרטי המשתמש');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);


  if (loading) return <Loding />;
  if (error) return <NotFound />;
  if (!user) return <div>משתמש לא נמצא</div>;

  return (
    <div className='user-profile-page' data-theme={isDark ? "dark" : "light"}>
      <Logo 
        auth={auth}
        isChecked={isDark}
        handleChange={() => setIsDark(!isDark)}
      />

      <div className='user-profile-body'>
      {auth ? (
          <div className="profile-container">
              <div className="profile-header">
                <img src={user.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"} alt="Profile Avatar" className="profile-avatar" />
                <h2>{user.firstName} {user.lastName}</h2>
              </div>
              <div className="profile-info">
                <p><strong>אימייל:</strong> {user.email}</p>
                {user.dateOfBirth && (
                  <>
                    <p><strong>גיל:</strong> {calculateAge(user.dateOfBirth)}</p>
                    <p><strong>תאריך לידה:</strong> {new Date(user.dateOfBirth).toLocaleDateString()}</p>
                  </>
                )}
                {user.gender && (
                  <p><strong>מין: </strong> 
                    {user.gender === 'זכר' ? 'זכר' : user.gender === 'נקבה' ? 'נקבה' : user.gender === 'אחר' ? 'אחר' : "לא ידוע"}
                  </p>
                )}
              </div>
              <div className="profile-stats">
                <div className='profile-stats-box'>
                    <LuTrophy className='icon first-place' /><p><strong>מקומות ראשונים:</strong></p>
                    <AnimatedCounter value={user.firstPlaces.length} includeDecimals={false}/>
                </div>
                <div className='profile-stats-box'>
                    <LuMedal className='icon second-place'/><p><strong>מקומות שניים:</strong></p>
                    <AnimatedCounter value={user.secondPlaces.length} includeDecimals={false}/>
                </div>
                <div className='profile-stats-box'>
                  <PiSoccerBallDuotone className='icon kog'/><p><strong>מלך השערים:</strong></p>
                  <AnimatedCounter className="profile-stats-box-value" value={user.KOG.length} includeDecimals={false}/>
                </div>
                <div className='profile-stats-box'>
                  <GiRunningShoe className='icon koa'/><p><strong>מלך הבישולים:</strong></p>
                  <AnimatedCounter className="profile-stats-box-value" value={user.KOA.length} includeDecimals={false}/>
                </div>
              </div>
          </div>
              ) : (
                <p>משתמש לא נמצא</p>
            )}
      </div>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
