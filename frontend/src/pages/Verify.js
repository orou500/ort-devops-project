import React, { useEffect, useState } from 'react';
import '../style/Verify.css'; // תוכל ליצור קובץ CSS נוסף לעיצוב אם תרצה
import { useAuth } from '../hooks/useAuth';
import useLocalStorage from 'use-local-storage';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import axios from '../api/axios'; // וודא שיש לך את axios מותקן
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { PulseLoader } from 'react-spinners';

const Verify = () => {
    const { auth, setAuth } = useAuth();
    const { addToast } = useToast();
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const verifyUser = async () => {
            if (isSubmitting) return; // מניעת שליחה כפולה
            setIsSubmitting(true); // סימון שהטופס נשלח
            const userId = window.location.pathname.split('/').pop(); // קח את ה-user ID מה-URL
            try {
                const response = await axios.get(`/user/verify/${userId}`); // שלח בקשה לשרת

                if (response.data) {
                    // נניח שהתגובה מכילה את המידע על המשתמש
                    const token = response.data.token;
                    const admin = response.data.user.admin;
                    const createdLeague = response.data.user.createdLeague;
                    const id = response.data.user._id;
                    const emailRes = response.data.user.email;
                    const firstName = response.data.user.firstName;
                    const lastName = response.data.user.lastName;
                    const profileImage = response.data.user.profileImage;
                    const dateOfBirth = response.data.user.dateOfBirth;
                    const gender = response.data.user.gender;
                    const leaguesId = response.data.user.leaguesId;
                    const tournamentsId = response.data.user.tournamentsId;
                    const firstPlaces = response.data.user.firstPlaces;
                    const secondPlaces = response.data.user.firstPlaces;
                    const KOG = response.data.user.KOG;
                    const KOA = response.data.user.KOA;
                    localStorage.setItem('token', token);
                    addToast({ id: Date.now(), message: 'אימות בוצע בהצלחה', type: 'success' });
                    setAuth({ id, email: emailRes, admin, createdLeague, firstName, lastName, profileImage, dateOfBirth, gender, leaguesId, tournamentsId, firstPlaces, secondPlaces, KOG, KOA})
                    navigate('/')
                }
            } catch (error) {
                navigate('/')
            }
        };

        if(!isSubmitting){
            verifyUser(); // קרא לפונקציה
        }
    }, [setAuth, navigate, addToast, isSubmitting]);

    return (
        <div className='verify-page' data-theme={isDark ? "dark" : "light"}>
            <Logo 
                isChecked={isDark}
                handleChange={() => setIsDark(!isDark)}
                auth={auth}
            />
            <div className='verify-body'>
                <h1>דף אימות משתמש</h1>
                <PulseLoader className="contact-loading" color="var(--primary-text-color)"/>
            </div>
            <Footer />
        </div>
    );
};

export default Verify;
