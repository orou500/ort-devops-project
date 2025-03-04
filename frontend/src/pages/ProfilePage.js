import React from 'react';
import { Link } from 'react-router-dom';
import "../style/ProfilePage.css";
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import useLocalStorage from 'use-local-storage';
import { LuMedal, LuTrophy } from 'react-icons/lu';
import { PiSoccerBallDuotone } from 'react-icons/pi';
import { AnimatedCounter } from 'react-animated-counter';
import UserLeagues from '../components/UserLeagues';
import { GiRunningShoe } from 'react-icons/gi';

const ProfilePage = () => {
    const { auth } = useAuth();
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

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

    return (
        <div className="profile-page" data-theme={isDark ? "dark" : "light"}>
            <Logo 
                isChecked={isDark}
                handleChange={() => setIsDark(!isDark)}
                auth={auth}
            />
            <div className='profile-body'>
                {auth ? (
                    <div className="profile-container">
                        <div className="profile-header">
                            <img src={auth.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"} alt="Profile Avatar" className="profile-avatar" />
                            <h2>{auth.firstName} {auth.lastName}</h2>
                        </div>
                        <div className="profile-info">
                            <p><strong>אימייל:</strong> {auth.email}</p>
                            {auth.dateOfBirth && (
                                <>
                                    <p><strong>גיל:</strong> {calculateAge(auth.dateOfBirth)}</p>
                                    <p><strong>תאריך לידה:</strong> {new Date(auth.dateOfBirth).toLocaleDateString()}</p>
                                </>
                            )}
                            {auth.gender && (
                                <p><strong>מין: </strong> 
                                    {auth.gender === 'זכר' ? 'זכר' : auth.gender === 'נקבה' ? 'נקבה' : auth.gender === 'אחר' ? 'אחר' : "לא ידוע"}
                                </p>
                            )}
                            {/* הוספת מידע על המיקומים */}
                            <div className="profile-stats">
                                <div className='profile-stats-box'>
                                    <LuTrophy className='icon first-place' /><p><strong>מקומות ראשונים:</strong></p>
                                    <AnimatedCounter value={auth.firstPlaces.length} includeDecimals={false}/>
                                </div>
                                <div className='profile-stats-box'>
                                    <LuMedal className='icon second-place'/><p><strong>מקומות שניים:</strong></p>
                                    <AnimatedCounter value={auth.secondPlaces.length} includeDecimals={false}/>
                                </div>
                                <div className='profile-stats-box'>
                                    <PiSoccerBallDuotone className='icon kog'/><p><strong>מלך השערים:</strong></p>
                                    <AnimatedCounter className="profile-stats-box-value" value={auth.KOG.length} includeDecimals={false}/>
                                </div>
                                <div className='profile-stats-box'>
                                    <GiRunningShoe className='icon koa'/><p><strong>מלך הבישולים:</strong></p>
                                    <AnimatedCounter className="profile-stats-box-value" value={auth.KOA.length} includeDecimals={false}/>
                                </div>
                            </div>
                        </div>
                        <div className="profile-actions">
                            <Link to={`/profile/edit`} className="edit-profile-button">
                                ערוך פרופיל
                            </Link>
                        </div>
                        <UserLeagues />
                    </div>
                ) : (
                    <p>משתמש לא נמצא</p>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ProfilePage;
