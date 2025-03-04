import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "../style/CreateTournamentV2.css";
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
import OddKnockoutBracket from '../components/OddKnockoutBracket';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import GroupStage from '../components/GroupStage';

const CreateTournamentV2 = () => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
    const { LeaguesSlug } = useParams(); 
    const { auth } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [tournamentDate, setTournamentDate] = useState(''); 
    const [title, setTitle] = useState('');
    const [results, setResults] = useState([]);
    const [users, setUsers] = useState([]);
    const [firstPlace, setFirstPlace] = useState('');
    const [secondPlace, setSecondPlace] = useState('');
    const [KOG, setKOG] = useState('');
    const [editKOG, setEditKOG] = useState(false);
    const [KOA, setKOA] = useState('');
    const [numAssists, setNumAssists] = useState(0);
    const [allPlayerGoals, setAllPlayerGoals] = useState();
    const [KOGMaxGoals, setKOGMaxGoals] = useState('');
    const [error, setError] = useState('');
    const [tournamentType, setTournamentType] = useState('חצי גמר');
    const [dummyPlayers, setDummyPlayers] = useState([]);
    const [tournamentData, setTournamentData] = useState([[], [], [], []]);
    const [images, setImages] = useState([]); // מערך לאחסון ה-URLs של התמונות
    const [isGroupStage, setIsGroupStage] = useState(false);
    const [numberOfGroups, setNumberOfGroups] = useState(null);
    const [groups, setGroups] = useState([]);
    const [groupWinners, setGroupWinners] = useState([]);
    
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
                element: '.checkbox-container',
                popover: {
                    title: 'הוספת שלב בתים',
                    description: 'אם תבחר באופציה זאת יתווסף שלב בתים ותיהיה חייב להוסיף משתמשים לבתים.',
                    side: "bottom", align: 'center',
                },
            },
            !isGroupStage ? {
                element: '.select-tournament-type',
                popover: {
                  title: 'סוג טורניר',
                  description: 'בבחירה הזאת ניתן לבחור 3 סוגים של טורנרים כאלה שמתחילים משמינית גמר, רבע גמר או חצי גמר.',
                  side: "bottom", align: 'center',
                },
            } : null,
            isGroupStage ? {
                element: '.group-selection-container',
                popover: {
                  title: 'בחירת מספר בתים',
                  description: 'בבחירה הזאת תצטרך לבחור את מספר הבתים בטורניר שים לב שבחירת הבתים משפיעה על שלב הטורניר.',
                  side: "bottom", align: 'center',
                },
            } : null,
              {
                element: '.btn-add-image',
                popover: {
                  title: 'הוספת תמונה',
                  description: 'בלחיצה על כפתור הוספת תמונה תוכל להוסיף תמונה או מספר תמונות באמצעות קישור אינטרנטי לאותה תמונה (הוספת תמונה אינה חובה).',
                  side: "top", align: 'center',
                },
              },
              {
                element: '.search-bar-container',
                popover: {
                  title: 'הוספת משתמשים',
                  description: 'בשורה זאת ניתן להוסיף משתמשים לטורניר שים לב שאתה חייב להוסיף לפחות משתמש אחד לטורניר.',
                  side: "top", align: 'center',
                },
              },
              {
                element: '.the-first-place',
                popover: {
                  title: 'מקום ראשון',
                  description: 'מקום ראשון הוא המשתמש שזכה בטורניר ושניצח את כולם. שים לב ששדה זה מתמלא אוטמטית לאחר בחירת המשחקים גם את מקום שני ומלך השערים. רק מלך הבישולים צרך למלא ידנית אך לא חובה.',
                  side: "top", align: 'center',
                },
              },
              isGroupStage && numberOfGroups ? {
                element: '.group-card',
                popover: {
                    title: 'שלב הבתים',
                    description: `שים לב שאתה חייב להוסיף בדיוק 4 שחקנים לבית ולהוסיף את הנקודות בבית לכל שחקן חובה שיהיה בכל בית 36 נקודות.`,
                    side: "top", align: 'center',
                  },
            } : null,
              {
                  element: '.add-games-tournament',
                  popover: {
                      title: 'הוספת משחק לטורניר',
                      description: `בהוספת משחק לטורניר צריך לבחור את כל המשחקים שהתרחשו בטורניר עצמו שים לב:\n <p class='text-red'>בחצי גמר</p> חובה להוסיף בדיוק 2 משחקים.\n<p class='text-red'>ברבע גמר</p> חובה להוסיף בדיוק 4 משחקים.\n <p class='text-red'>ובשמינית גמר</p> חובה להוסיף בדיוק 8 משחקים.`,
                      side: "top", align: 'center',
                    },
                },
                {
                  element: '.select-teams-tournament',
                  popover: {
                    title: 'בחירת קבוצות',
                    description: 'בבחירת הקבוצות צריך לבחור שני משתמשים שהתחרו אחת נגד השניה שים לב שלאחר בחירת משתמשים אלו לא יהיה נתן לבחור בהם שוב באותו השלב.',
                    side: "top", align: 'center',
                  },
                },
                {
                  element: '.result-game-team-1',
                  popover: {
                    title: 'בחירת תוצאת משחק',
                    description: 'בבחירת תוצאות משחק אתה צריך למלא את מספר הגולים באותו משחק שים לב שכאשר אתה ממלא את מספר הגולים לקבוצה בחרת בשדה הנכון ובקובצה הנכונה.',
                    side: "top", align: 'center',
                  },
                },
                {
                  element: '.select-tournament-level',
                  popover: {
                    title: 'בחירת שלב משחק',
                    description: 'בבחירת שלב משחק שים לב שאתה מוסיף את המשחק לשלב הנכון (דוגמה: לאחר שמלאת את שלב חצי גמר במשחקים תצטרך לעבור לשלב גמר).',
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

      const handleGroupStageToggle = () => {
        setIsGroupStage(!isGroupStage);
        if (!isGroupStage) {
          setNumberOfGroups(null);
          setTournamentType("חצי גמר");
          setGroups([]);
        }
      };
    
      const handleGroupSelection = (groups) => {
        setNumberOfGroups(groups);
    
        if (groups === 4) setTournamentType("חצי גמר");
        else if (groups === 8) setTournamentType("רבע גמר");
        else if (groups === 16) setTournamentType("שמינית גמר");
    
        // יצירת הבתים
        const newGroups = [];
        for (let i = 1; i <= groups; i++) {
          newGroups.push({ id: i, teams: [] });
        }
        setGroups(newGroups);
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

    const checkForDuplicatePlayers = (tournamentData) => {
        const seenPlayers = new Set(); // סט לאחסון שחקנים שנראו כבר
        let hasDuplicates = false;
    
        tournamentData.forEach(stage => {
            const stageSeenPlayers = new Set(); // סט חדש לכל שלב
    
            stage.forEach(match => {
                const { team1, team2 } = match;
    
                // בדוק אם הקבוצות נוספו כבר לסט של השלב הנוכחי
                if (stageSeenPlayers.has(team1)) {
                    hasDuplicates = true; // אם נמצאה כפילות
                } else {
                    stageSeenPlayers.add(team1); // הוסף את הקבוצה לסט של השלב הנוכחי
                }
    
                if (stageSeenPlayers.has(team2)) {
                    hasDuplicates = true; // אם נמצאה כפילות
                } else {
                    stageSeenPlayers.add(team2); // הוסף את הקבוצה לסט של השלב הנוכחי
                }
    
                // אם כבר ראינו קבוצה זו בכל השלבים, הוסף אותה לסט הגלובלי
                seenPlayers.add(team1);
                seenPlayers.add(team2);
            });
        });
    
        return hasDuplicates;
    };

    useEffect(() => {
        if (tournamentData.length === 0) return;

        const duplicatesExist = checkForDuplicatePlayers(tournamentData);
        if (duplicatesExist) {
            addToast({ id: Date.now(), message: 'יש שחקן המופיע יותר מפעם אחת בטורניר!', type: 'error' });
        }
    
        // שלב אחרון
        const lastStageMatches = tournamentData[tournamentData.length - 1];
        
        if (lastStageMatches.length > 0) {
            const lastMatch = lastStageMatches[0];
            const { team1, team2, score1, score2 } = lastMatch;
    
            // בדוק מי מקום ראשון ומי מקום שני
            let MatchesfirstPlace = '';
            let MatchessecondPlace = '';
    
            if (score1 > score2) {
                MatchesfirstPlace = team1;
                MatchessecondPlace = team2;
            } else if (score2 > score1) {
                MatchesfirstPlace = team2;
                MatchessecondPlace = team1;
            } else {
                // במקרה של תיקו
                MatchesfirstPlace = team1; // נניח שteam1 זוכה במקרה של תיקו
                MatchessecondPlace = team2;
            }
    
            // מצא את המשתמשים לפי שם הקבוצה
            const firstPlaceUser = users.find(user => `${user.firstName} ${user.lastName}` === MatchesfirstPlace);
            const secondPlaceUser = users.find(user => `${user.firstName} ${user.lastName}` === MatchessecondPlace);
    
            // עדכון המקום הראשון והשני אם הם לא "שחקנים מדומים"
            if (firstPlaceUser && !MatchesfirstPlace.includes('שחקן מדומה')) {
                setFirstPlace(firstPlaceUser);
            } else {
                setFirstPlace('');
            }
    
            if (secondPlaceUser && !MatchessecondPlace.includes('שחקן מדומה')) {
                setSecondPlace(secondPlaceUser);
            } else {
                setSecondPlace('');
            }
        }
    // ספירת שערים ומציאת הקבוצה עם הכי הרבה שערים
    const goalCounts = {};
    const playerGoals = []; // שמירת השחקנים עם כמות השערים

    tournamentData.forEach(stage => {
        stage.forEach(match => {
            const { team1, team2, score1, score2 } = match;

            // עדכון שערים לקבוצה 1
            if (goalCounts[team1]) {
                goalCounts[team1] += score1;
            } else {
                goalCounts[team1] = score1;
            }

            // עדכון שערים לקבוצה 2
            if (goalCounts[team2]) {
                goalCounts[team2] += score2;
            } else {
                goalCounts[team2] = score2;
            }
        });
    });

    // מצא את הקבוצה עם הכי הרבה שערים
    let maxGoals = 0;
    let topScoringTeam = '';

    for (const team in goalCounts) {
        if (goalCounts[team] > maxGoals) {
            maxGoals = goalCounts[team];
            topScoringTeam = team;
        }

        // שמור את השחקן וכמות השערים במערך
        const user = users.find(user => `${user.firstName} ${user.lastName}` === team);
        if (user) {
            playerGoals.push({
                name: `${user.firstName} ${user.lastName}`,
                goals: goalCounts[team]
            });
        }
    }

    // מציאת המשתמש עם הכי הרבה שערים
    const topScoringUser = users.find(user => `${user.firstName} ${user.lastName}` === topScoringTeam);

    // הצג בלוג רק אם הקבוצה אינה "שחקן מדומה"
    if (topScoringUser && !topScoringTeam.includes('שחקן מדומה')) {
        setKOGMaxGoals(maxGoals);
        setKOG(topScoringUser._id);
    } else {
        setKOGMaxGoals('');
        setKOG('');
    }

    // הצגת רשימת השחקנים עם מספר השערים
    setAllPlayerGoals(playerGoals)
}, [tournamentData, users, addToast]);
    
    
    
    const updateDummyPlayers = useCallback(() => {
        const requiredPlayers = getRequiredPlayers(tournamentType, isGroupStage);
        if (users.length < requiredPlayers) {
            const missingPlayers = requiredPlayers - users.length;
            const newDummyPlayers = createDummyPlayers(missingPlayers);
            setDummyPlayers(newDummyPlayers);
        } else {
            setDummyPlayers([]);
        }
    }, [tournamentType, users, isGroupStage]);

    useEffect(() => {
        updateDummyPlayers();
    }, [tournamentType, users, tournamentData, updateDummyPlayers]);

    const getRequiredPlayers = (type, stage) => {
        if(stage) {
            switch (type) {
                case 'חצי גמר': return 16;
                case 'רבע גמר': return 32;
                case 'שמינית גמר': return 64;
                default: return 0;
            }
        } else {
            switch (type) {
                case 'חצי גמר': return 4;
                case 'רבע גמר': return 8;
                case 'שמינית גמר': return 16;
                default: return 0;
            }
            
        }
    };

    const createDummyPlayers = (count) => {
        return Array.from({ length: count }, (_, index) => ({
            _id: `dummy-${index}`,
            firstName: `שחקן`,
            lastName: `מדומה ${index + 1}`,
            email: `dummy${index + 1}@fake.com`
        }));
    };

    const allPlayers = [...users, ...dummyPlayers];

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const duplicatesExist = checkForDuplicatePlayers(tournamentData);
        if (duplicatesExist) {
            addToast({ id: Date.now(), message: 'יש שחקן המופיע יותר מפעם אחת בטורניר!', type: 'error' });
            return;
        }

        if (!title || !firstPlace || !secondPlace || !KOG || !KOA || !tournamentDate) {
            addToast({ id: Date.now(), message: 'יש למלא את כל השדות', type: 'error' });
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

        const koaPlayer = users.find(user => user._id === KOA);
        const kogPlayer = users.find(user => user._id === KOG);
    
        let playerAssists = [];
    
        if (koaPlayer && numAssists) {
            playerAssists = [{ name: `${koaPlayer.firstName} ${koaPlayer.lastName}`, assists: numAssists }];
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`/leagues/${LeaguesSlug}`, {
                tournamentData,
                groups,
                title,
                firstPlace: firstPlace._id,
                secondPlace: secondPlace._id,
                KOG: kogPlayer._id,
                KOA: KOA,
                playerGoals: allPlayerGoals,
                playerAssists,
                images: images.filter(Boolean),
                users,
                createdAt: tournamentDate,
            }, {
                headers: { Authorization: `${token}` }
            });

            if (response.status === 201) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                addToast({ id: Date.now(), message: 'טורניר נוצר בהצלחה', type: 'success' });
                navigate(`/leagues/${LeaguesSlug}`);
            }
        } catch (err) {
            addToast({ id: Date.now(), message: `${err}`, type: 'error' });
            setError('שגיאה ביצירת המשחק');
        } finally {
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
                    <div className="checkbox-container">
                        <label className="checkbox-label">
                            <input
                            type="checkbox"
                            checked={isGroupStage}
                            onChange={handleGroupStageToggle}
                            className="styled-checkbox"
                            />
                            <span className="custom-checkbox"></span>
                            שלב בתים
                        </label>
                    </div>


                    {isGroupStage ? (
                        <div className="group-selection-container">
                            <label className="group-selection-label">
                                בחר מספר בתים:
                                <select
                                value={numberOfGroups || ""}
                                onChange={(e) => handleGroupSelection(parseInt(e.target.value))}
                                className="group-selection-dropdown"
                                >
                                <option value="" disabled>
                                    בחר
                                </option>
                                <option value={4}>4 בתים</option>
                                <option value={8}>8 בתים</option>
                                <option value={16}>16 בתים</option>
                                </select>
                            </label>

                            {tournamentType && (
                                <p className="tournament-type">
                                שלב אוטומטי: {tournamentType}
                                </p>
                            )}
                        </div>

                    ): (
                        <>
                        <label>סוג טורניר:</label>
                        <select
                            className='input-create-tournament select-tournament-type'
                            value={tournamentType}
                            onChange={(e) => setTournamentType(e.target.value)}
                        >
                            <option value='שמינית גמר'>שמינית גמר</option>
                            <option value='רבע גמר'>רבע גמר</option>
                            <option defaultValue value='חצי גמר'>חצי גמר</option>
                        </select>
                        </>
                    )}
                        <label>כותרת הטורניר:</label>
                        <input
                            className='input-create-tournament'
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="כותרת הטורניר"
                        />

                        <label>תאריך הטורניר:</label>
                        <input
                            className='input-create-tournament'
                            type="date"
                            max={getCurrentDate()} 
                            value={tournamentDate}
                            onChange={(e) => setTournamentDate(e.target.value)}
                        />
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
                        <label>מי השתתף בטורניר:</label>
                        <div className='create-tournament-users-list'>
                            <UsersList users={users} setUsers={setUsers} />
                        </div>
                        <div className="search-bar-container">
                            <SearchBar setResults={setResults} auth={auth} setIsLoading={setIsLoading} searchInLeague={true}/>
                            {isLoading ? (
                            <div className="loading">טוען נתונים...</div>
                            ) : (
                            results.length > 0 && <SearchResultsList results={results} users={users} setUsers={setUsers} />
                            )}
                        </div>

                        <label>מקום ראשון:</label>
                        {firstPlace ? (
                            <p className="tournament-winner the-first-place">
                                {firstPlace.firstName} {firstPlace.lastName}
                            </p>
                        ) : (
                            <p className="tournament-winner the-first-place">טרם נקבע</p>
                        )}

                        <label>מקום שני:</label>
                        {secondPlace ? (
                            <p className="tournament-runner-up">
                                {secondPlace.firstName} {secondPlace.lastName}
                            </p>
                        ) : (
                            <p className="tournament-runner-up">טרם נקבע</p>
                        )}
                        <label>מלך השערים:</label>
                        {KOG && KOGMaxGoals && !editKOG ? (
                            (() => {
                                const KOGUser = users.find((user) => user._id === KOG);
                                return KOGUser ? (
                                    <p className="tournament-runner-up">
                                        {KOGUser.firstName} {KOGUser.lastName} - {KOGMaxGoals} שערים
                                        <button
                                            className="edit-button"
                                            onClick={() => setEditKOG(true)}
                                        >
                                            ערוך
                                        </button>
                                    </p>
                                ) : (
                                    <p className="tournament-runner-up">משתמש לא נמצא</p>
                                );
                            })()
                        ) : editKOG ? (
                            <></>
                        ) : (
                            <p className="tournament-runner-up">טרם נקבע</p>
                        )}
                        {
                            editKOG ? (
                                <div className='tournament-runner-up'>
                                    <select
                                        className='input-create-tournament'
                                        value={KOG}
                                        onChange={(e) => setKOG(e.target.value)}
                                    >
                                        <option value="">בחר מלך שערים</option>
                                        {allPlayers.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.firstName} {user.lastName} - {user.email}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                    className="edit-button"
                                    onClick={() => setEditKOG(false)}
                                    >
                                        ערוך
                                    </button>
                                </div>
                            
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
                            {allPlayers.map((user) => (
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

                        <button type="submit" className="btn-create-tournament last-btn">צור משחק</button>
                    </form>
                </div>
                <div>
                    {isGroupStage ? (
                        <div style={{width: "100vw"}}>
                            <GroupStage groups={groups} setGroups={setGroups} users={allPlayers} winners={groupWinners} setWinners={setGroupWinners} />
                            <div className='tournament-bracket'>
                                <OddKnockoutBracket users={groupWinners} KnockoutType={tournamentType} tournamentData={tournamentData} setTournamentData={setTournamentData}/>
                            </div>
                        </div>
                    ) : (
                        <div className='tournament-bracket'>
                            <OddKnockoutBracket users={allPlayers} KnockoutType={tournamentType} tournamentData={tournamentData} setTournamentData={setTournamentData}/>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CreateTournamentV2;
