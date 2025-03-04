import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axios';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import useLocalStorage from 'use-local-storage';
import '../style/ResetPassword.css'; // קובץ ה-CSS לעיצוב המודרני
import { Footer } from '../components/Footer';
import { useToast } from '../context/ToastContext';

const ResetPassword = () => {
    const { token } = useParams();
    const { addToast } = useToast();
    const { auth } = useAuth();
    const navigate = useNavigate();
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setMessage('הסיסמאות לא תואמות');
        }
        const host = window.location.host;
        const protocol = window.location.protocol;
        try {
            const res = await axios.post(`/reset-password/${token}`,
                 { 
                    password,
                    protocol,
                    webSite: host,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                      }
            });
            if(res){
                addToast({ id: Date.now(), message: 'הסיסמה עודכנה בהצלחה', type: 'success' });
                navigate('/'); // מעביר לדף הראשי אחרי 10 שניות
            }
        } catch (err) {
            setMessage('שגיאה באיפוס הסיסמה');
        }
    };

    return (
        <div className="reset-password-page" data-theme={isDark ? "dark" : "light"}>
            <Logo 
                isChecked={isDark}
                noNav={true}
                handleChange={() => setIsDark(!isDark)}
                auth={auth}
            />
            <div className='reset-password-body'>
                <div className="reset-password-container">
                    <div className="reset-password-box">
                        <h1>איפוס סיסמה</h1>
                        <p>אנא הזן את הסיסמה החדשה שלך:</p>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="password"
                                placeholder="סיסמה חדשה"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="אשר סיסמה"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button type="submit">אפס סיסמה</button>
                        </form>
                        {message && <p className="message">{message}</p>}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ResetPassword;
