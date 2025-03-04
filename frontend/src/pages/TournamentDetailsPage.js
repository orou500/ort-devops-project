import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from '../api/axios';
import "../style/TournamentDetailsPage.css";
import Loding from './Loding';
import NotFound from './NotFound';
import { useAuth } from '../hooks/useAuth';
import useLocalStorage from 'use-local-storage';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import UsersListComponents from '../components/UsersListComponents';
import { LuMedal, LuTrophy } from "react-icons/lu";
import { PiSoccerBallDuotone } from "react-icons/pi";
import { useToast } from '../context/ToastContext';
import TournamentBracket from '../components/TournamentBracket';
import GoalsTable from '../components/GoalsTable';
import Slider from "react-slick"; // ייבוא של קרוסלה
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { GiRunningShoe } from 'react-icons/gi';
import ViewGroupStage from '../components/ViewGroupStage';

const TournamentDetailsPage = () => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
    const { auth } = useAuth(); // וודא ש-auth מחזיר את המידע על המשתמש
    const { addToast } = useToast();
    const { leagueSlug, tournamentSlug } = useParams();
    const [tournament, setTournament] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const startGuide = () => {
        const steps = [
            {
                popover: {
                    title: 'דף הטורניר',
                    description: 'בדף הטורניר ניתן לראות את כל המידע על הטורניר.',
                    side: "top", align: 'center',
                },
            },
            tournament.images && tournament.images.length > 0 ?{
                element: '.tournament-images',
                popover: {
                    title: 'תמונות הטורניר',
                    description: 'כאן ניתן לראות את תמונות מהטורניר.',
                    side: "bottom", align: 'center',
                },
            } : null,
            {
                element: '.details-container',
                popover: {
                    title: 'תוצאות הטורניר',
                    description: 'כאן ניתן לראות את תוצאות הטורניר.',
                    side: "bottom", align: 'center',
                },
            },
            {
                element: '.league-users',
                popover: {
                    title: 'רשימת משתמשים',
                    description: 'כאן ניתן לראות את רשימת המשתמשים בטורניר. בלחיצה על אחד המשתמשים תגיע לפרופיל המשתמש.',
                    side: "top", align: 'center',
                },
            },
            tournament.playerGoals && tournament.playerGoals.length > 0 ? {
                element: '.tournament-goals',
                popover: {
                    title: 'טבלת שערים',
                    description: 'כאן ניתן לראות את טבלת השערים לכל משתמש בטורניר.',
                    side: "top", align: 'center',
                },
            } : null,
            tournament.playerAssists && tournament.playerAssists.length > 0 ? {
                element: '.tournament-assists',
                popover: {
                    title: 'טבלת בישולים',
                    description: 'כאן ניתן לראות את טבלת הבישולים לכל משתמש בטורניר.',
                    side: "top", align: 'center',
                },
            } : null,
            tournament.groupStage && tournament.groupStage.length > 0 ? {
                element: '.groups-container-wrapper',
                popover: {
                    title: 'שלב בתים',
                    description: 'כאן ניתן לראות את שלב הבתים של הטורניר.',
                    side: "top", align: 'center',
                },
            } : null,
            tournament.tournamentData && tournament.tournamentData.length > 0 ? {
                element: '.tournament-bracket',
                popover: {
                    title: 'טבלת נוקאאוט',
                    description: 'כאן ניתן לראות את טבלת הנוקאאוט של הטורניר.',
                    side: "top", align: 'center',
                },
            } : null,
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
        const fetchTournament = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`/leagues/${leagueSlug}/tournaments/${tournamentSlug}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `${token}`,
                    }
                });
                setTournament(response.data.tournament);
                setIsLoading(false);
            } catch (err) {
                addToast({ id: Date.now(), message: `${err}`, type: 'error' });
                setError('שגיאה בטעינת נתוני המשחק');
                setIsLoading(false);
            }
        };
        fetchTournament();
    }, [leagueSlug, tournamentSlug, addToast]);

    if (isLoading) {
        return <Loding />;
    }

    if (error) {
        return <NotFound />;
    }

    const stageNames = ['שמינית גמר', 'רבע גמר', 'חצי גמר', 'גמר'];
    // קביעת האינדקס של השלב הראשון שמלא
    const currentStageIndex = tournament.tournamentData.findIndex(stage => stage.length > 0);
    // אם לא נמצא שלב שמלא, קבע את האינדקס האחרון
    const knockoutIndex = currentStageIndex >= 0 ? currentStageIndex : stageNames.length - 1;
    // קביעת ה-availableStages
    const availableStages = stageNames.slice(knockoutIndex);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };


    return (
        <div className='tournament-details-page' data-theme={isDark ? "dark" : "light"}>
            <Logo 
                isChecked={isDark}
                handleChange={() => setIsDark(!isDark)}   
                auth={auth}
            />
            <div className="tournament-details-body">
                {tournament ? (
                    <>
                        <div className="tournament-details-container">
                        <button className="button-modern" onClick={startGuide}>
                            מדריך אישי
                        </button>
                            <h2>{tournament.title}</h2>
                            <p>תאריך: {new Date(tournament.createdAt).toLocaleDateString()}</p>

                            {tournament.images && tournament.images.length > 0 && (
                                <div className='tournament-images'>
                                    <h3>תמונות מהטורניר:</h3>
                                    {
                                        tournament.images.length === 1 ? (
                                            <div key={tournament.images[0]}>
                                                <img src={tournament.images[0]} alt={`${tournament.images[0].title}`} className='tournament-image' />
                                            </div>
                                        ) : (
                                            <Slider {...sliderSettings}>
                                            {tournament.images.map((image, index) => (
                                                <div key={index}>
                                                    <img src={image} alt={`${tournament.title} ${index + 1}`} className='tournament-image' />
                                                </div>
                                            ))}
                                        </Slider>
                                        )
                                    }
                                </div>
                            )}
                            <div className='details-container'>
                                {/* בדיקת המשתמש הנוכחי */}
                                <p><LuTrophy className='icon first-place' /> מקום ראשון <LuTrophy className='icon first-place' /></p>
                                {auth.id === tournament.firstPlace._id ? (
                                    <Link to="/profile" key={ tournament.firstPlace._id + ' firstPlace'}>
                                        {tournament.firstPlace.firstName} {tournament.firstPlace.lastName}
                                    </Link>
                                ) : tournament.firstPlace.email ? (
                                    <Link to={`/users/${tournament.firstPlace._id}`} key={tournament.firstPlace._id + ' firstPlace'}>
                                        {tournament.firstPlace.firstName} {tournament.firstPlace.lastName}
                                    </Link>
                                ) : (
                                    <p key={tournament.firstPlace.firstName + ' firstPlace'}>
                                        {tournament.firstPlace.firstName} {tournament.firstPlace.lastName}
                                    </p>
                                )}

                                <p><LuMedal className='icon second-place'/> מקום שני <LuMedal className='icon second-place'/></p>
                                {auth.id === tournament.secondPlace._id ? (
                                    <Link to="/profile" key={ tournament.secondPlace._id + ' secondPlace'}>
                                        {tournament.secondPlace.firstName} {tournament.secondPlace.lastName}
                                    </Link>
                                ) : tournament.secondPlace.email ? (
                                    <Link to={`/users/${tournament.secondPlace._id}`} key={tournament.secondPlace._id + ' secondPlace'}>
                                        {tournament.secondPlace.firstName} {tournament.secondPlace.lastName}
                                    </Link>
                                ) : (
                                    <p key={tournament.secondPlace.firstName + ' secondPlace'}>
                                        {tournament.secondPlace.firstName} {tournament.secondPlace.lastName}
                                    </p>
                                )}

                                <p><PiSoccerBallDuotone className='icon kog'/> מלך השערים <PiSoccerBallDuotone className='icon kog'/></p>
                                {auth.id === tournament.KOG._id ? (
                                    <Link to="/profile"  key={ tournament.KOG._id + ' KOG'}>
                                        {tournament.KOG.firstName} {tournament.KOG.lastName}
                                    </Link>
                                ) : tournament.KOG.email ? (
                                    <Link to={`/users/${tournament.KOG._id}`} key={tournament.KOG._id + ' KOG'}>
                                        {tournament.KOG.firstName} {tournament.KOG.lastName}
                                    </Link>
                                ) : (
                                    <p key={tournament.KOG.firstName + ' KOG'}>
                                        {tournament.KOG.firstName} {tournament.KOG.lastName}
                                    </p>
                                )}

                                <p><GiRunningShoe className='icon koa'/> מלך הבישולים <GiRunningShoe className='icon koa'/></p>
                                {auth.id === tournament.KOA._id ? (
                                    <Link to="/profile"  key={ tournament.KOA._id + ' KOA'}>
                                        {tournament.KOA.firstName} {tournament.KOA.lastName}
                                    </Link>
                                ) : tournament.KOA.email ? (
                                    <Link to={`/users/${tournament.KOA._id}`} key={tournament.KOA._id + ' KOA'}>
                                        {tournament.KOA.firstName} {tournament.KOA.lastName}
                                    </Link>
                                ) : (
                                    <p key={tournament.KOA.firstName + ' KOA'}>
                                        {tournament.KOA.firstName} {tournament.KOA.lastName}
                                    </p>
                                )}
                            </div>


                            {/* רשימת המשתתפים */}
                            <div className='dif-background'>
                                <UsersListComponents 
                                    users={tournament.users} 
                                    postsPerPageNumber={3} 
                                    totalUsers={tournament.users.length} 
                                />
                            </div>
                                    {
                                        tournament && tournament.playerGoals && tournament.playerGoals.length > 0 ? (
                                            <div className='tournament-goals'>
                                                <h3>טבלת שערים:</h3>
                                                <GoalsTable playerGoals={tournament.playerGoals} />
                                            </div>
                                        ) : (
                                            <p>אין נתונים על שערים של שחקנים.</p>
                                        )
                                    }
                                    {
                                        tournament && tournament.playerAssists && tournament.playerAssists.length > 0 ? (
                                            <div className='tournament-goals tournament-assists'>
                                                <h3>טבלת בישולים:</h3>
                                                <GoalsTable playerGoals={tournament.playerAssists} Assists={true} />
                                            </div>
                                        ) : (
                                            <p>אין נתונים על בישולים של שחקנים.</p>
                                        )
                                    }
                        </div>
                        {
                            tournament && tournament.groupStage && tournament.groupStage.length > 0 ? (
                                <ViewGroupStage groups={tournament.groupStage} />
                            ) : (
                                <></>
                            )
                        }
                        {
                            tournament && tournament.tournamentData && tournament.tournamentData.length > 0 ? (
                                <div className='tournament-container'>
                                    <h3>מפת טורניר:</h3>
                                    {/* כאשר מביאים TournamentBracket צריך לשים לב שיש לו tournament-container*/}
                                    <TournamentBracket 
                                        availableStages={availableStages} 
                                        tournamentData={tournament.tournamentData} 
                                        knockoutIndex={knockoutIndex} // תעדכן את האינדקס לפי הצורך
                                    />
                                </div>

                            ) : (
                                <></>
                            )
                        }
                    </>
                ) : (
                    <p>הטורניר לא נמצא</p>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default TournamentDetailsPage;
