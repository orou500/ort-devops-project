import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../style/CreateTournament.css";
import useLocalStorage from 'use-local-storage';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { Footer } from '../components/Footer';
import { UsersList } from '../components/UsersList';
import { SearchBar } from '../components/SearchBar';
import { SearchResultsList } from '../components/SearchResultsList';
import axios from '../api/axios';
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const CreateTournament = () => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
    const { LeaguesSlug } = useParams(); // מזהה הליגה מה-URL
    const { auth } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [tournamentDate, setTournamentDate] = useState(''); // משתנה לתאריך המשחק
    const [results, setResults] = useState([]);
    const [users, setUsers] = useState([]);
    const [firstPlace, setFirstPlace] = useState('');
    const [secondPlace, setSecondPlace] = useState('');
    const [KOG, setKOG] = useState('');
    const [numGoals, setNumGoals] = useState(0);
    const [KOA, setKOA] = useState('');
    const [numAssists, setNumAssists] = useState(0);
    const [error, setError] = useState('');
    const [images, setImages] = useState([]); // מערך לאחסון ה-URLs של התמונות

    const startGuide = () => {
        const steps = [
          {
            popover: {
              title: 'דף יצירת טורניר',
              description: 'דף זה נועד לעזור לכם ליצירת טורניר חדש.',
              side: "top", align: 'center',
            },
          },
          {
            element: '.search-bar-container',
            popover: {
              title: 'הוספת משתמשים',
              description: 'בשורה זאת ניתן להוסיף משתמשים לטורניר שים לב שאתה חייב להוסיף לפחות משתמש אחד לטורניר.',
              side: "bottom", align: 'center',
            },
          },
          {
            element: '.the-first-place',
            popover: {
              title: 'מקום ראשון',
              description: 'מקום ראשון הוא המשתמש שזכה בטורניר ושניצח את כולם. שים לב שחובה למלא גם את מקום שני מלך השערים ומלך הבישולים.',
              side: "top", align: 'center',
            },
          },
          {
            element: '.btn-add-image',
            popover: {
              title: 'הוספת תמונה',
              description: 'בלחיצה על כפתור הוספת תמונה תוכל להוסיף תמונה או מספר תמונות באמצעות קישור אינטרנטי לאותה תמונה (הוספת תמונה אינה חובה).',
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

        // הפונקציה מחזירה את התאריך הנוכחי בפורמט YYYY-MM-DD
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

        // הוספת שדה URL חדש לתמונות
        const addImageInput = () => {
            setImages([...images, '']);
        };
    
        // עדכון מערך ה-URLs של התמונות
        const handleImageChange = (index, value) => {
            const newImages = [...images];
            newImages[index] = value;
            setImages(newImages);
        };

        const isValidImageUrl = (url) => {
            const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
            const imagePattern = /\.(jpeg|jpg|gif|png|bmp|webp)$/i;
        
            return urlPattern.test(url) && imagePattern.test(url);
        };
        

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!title || !firstPlace || !secondPlace || !KOG || !KOA || !tournamentDate) {
            setError('יש למלא את כל השדות');
            setIsLoading(false);
            return;
        }

        if (title.length < 6 || title.length > 50) {
            addToast({ id: Date.now(), message: 'הכותרת חייבת להיות בין 6 ל-50 תווים.', type: 'error' });
            return; // מחזיר את הפונקציה אם הבדיקה לא עברה
        }

        const invalidImage = images.some(image => image && !isValidImageUrl(image));
        if (invalidImage) {
            addToast({ id: Date.now(), message: 'אחד או יותר מה-URLs של התמונות אינו תקין', type: 'error' });
            setError('אחד או יותר מה-URLs של התמונות אינו תקין');
            setIsLoading(false);
            return;
        }

        const kogPlayer = users.find(user => user._id === KOG);
        const koaPlayer = users.find(user => user._id === KOA);
    
        let playerGoals = [];
        let playerAssists = [];
    
        if (kogPlayer && numGoals) {
            playerGoals = [{ name: `${kogPlayer.firstName} ${kogPlayer.lastName}`, goals: numGoals }];
        }
    
        if (koaPlayer && numAssists) {
            playerAssists = [{ name: `${koaPlayer.firstName} ${koaPlayer.lastName}`, assists: numAssists }];
        }
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/leagues/${LeaguesSlug}`, {
                title,
                firstPlace,
                secondPlace,
                KOG,
                KOA,
                users,
                playerGoals,
                playerAssists,
                images: images.filter(Boolean),
                createdAt: tournamentDate,
            }, {
                headers: { 
                    Authorization: `${token}` 
                }
            });

            if (response.status === 201) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                addToast({ id: Date.now(), message: 'טורניר נוצר בהצלחה', type: 'success' });
                navigate(`/leagues/${LeaguesSlug}`);
                setIsLoading(false);
            }

        } catch (err) {
            addToast({ id: Date.now(), message: `${err}`, type: 'error' });
            setError('שגיאה ביצירת המשחק');
            setIsLoading(false);
        }
    };

    return (
        <div className='create-tournament-page' data-theme={isDark ? "dark" : "light"}>
            <Logo 
                isChecked={isDark}
                handleChange={() => setIsDark(!isDark)}
                auth={auth}
            />
            <div className='create-tournament-body'>
                <div className="create-tournament-container">
                    <button className="button-modern" onClick={startGuide}>
                        מדריך אישי
                    </button>
                    <h2>צור טורניר חדש</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <label>כותרת הטורניר:</label>
                        <input
                            className='input-create-tournament'
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="כותרת הטורניר"
                            required
                        />

                        <label>תאריך המשחק:</label>
                        <input
                            className='input-create-tournament'
                            type="date"
                            max={getCurrentDate()} 
                            value={tournamentDate}
                            onChange={(e) => setTournamentDate(e.target.value)}
                            required
                        />

                        <label>מי השתתף בטורניר:</label>
                        <div className='create-tournament-users-list'>
                            <UsersList users={users} setUsers={setUsers}/>
                        </div>
                        <div className="search-bar-container">
                            <SearchBar setResults={setResults} auth={auth} setIsLoading={setIsLoading} searchInLeague={true}/>
                            {isLoading ? (
                            <div className="loading">טוען נתונים...</div>
                            ) : (
                            results && results.length > 0 && <SearchResultsList results={results} users={users} setUsers={setUsers} isLoading={isLoading} />
                            )}
                        </div>

                        <label>מקום ראשון:</label>
                        <select
                            className='input-create-tournament the-first-place'
                            value={firstPlace}
                            onChange={(e) => setFirstPlace(e.target.value)}
                        >
                            <option value="">בחר מקום ראשון</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName} - {user.email}
                                </option>
                            ))}
                        </select>

                        <label>מקום שני:</label>
                        <select
                            className='input-create-tournament'
                            value={secondPlace}
                            onChange={(e) => setSecondPlace(e.target.value)}
                        >
                            <option value="">בחר מקום שני</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName} - {user.email}
                                </option>
                            ))}
                        </select>

                        <label>מלך השערים:</label>
                        <select
                            className='input-create-tournament'
                            value={KOG}
                            onChange={(e) => setKOG(e.target.value)}
                        >
                            <option value="">בחר מלך שערים</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName} - {user.email}
                                </option>
                            ))}
                        </select>
                        {
                            KOG ? (
                                <>
                                    <label>כמות שערים:</label>
                                    <input
                                        className='input-create-tournament'
                                        type="number"
                                        value={numGoals}
                                        onChange={(e) => setNumGoals(e.target.value)}
                                        placeholder="כמות שערים"
                                        required
                                    />
                                </>
                            ) : (
                                <>
                                </>
                            )
                        }
                        <label>מלך הבישולים:</label>
                        <select
                            className='input-create-tournament'
                            value={KOA}
                            onChange={(e) => setKOA(e.target.value)}
                            >
                            <option value="">בחר מלך בישולים</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName} - {user.email}
                                </option>
                            ))}
                        </select>
                            {
                                KOA ? (
                                    <>
                                        <label>כמות בישולים:</label>
                                        <input
                                            className='input-create-tournament'
                                            type="number"
                                            value={numAssists}
                                            onChange={(e) => setNumAssists(e.target.value)}
                                            placeholder="כמות בישולים"
                                            required
                                        />
                                    </>
                                ) : (
                                    <>
                                    </>
                                )
                            }
                        <label>תמונות הטורניר:</label>
                        {images.length > 0 && images.map((image, index) => (
                            <input
                                key={index}
                                type="text"
                                className="input-create-tournament"
                                value={image}
                                placeholder="הכנס URL של תמונה"
                                onChange={(e) => handleImageChange(index, e.target.value)}
                            />
                        ))}
                        <button type="button" className="btn-add-image" onClick={addImageInput}>
                            הוסף תמונה
                        </button>
                        <button type="submit" className="btn-create-tournament last-btn">צור משחק</button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CreateTournament;
