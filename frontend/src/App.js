import './App.css';
import useLocalStorage from 'use-local-storage';
import { Logo } from './components/Logo';
import { Login } from './components/Login';
import { Footer } from './components/Footer';
import { Firefly } from './components/Firefly';
import { Contact } from './components/Contact';
import { useAuth } from './hooks/useAuth';
import UserLeagues from './components/UserLeagues';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

function App() {
  const { auth } = useAuth();
  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

  const startGuide = () => {
    const driverObj = driver({
      showProgress: true,
      doneBtnText: 'סיום',
      closeBtnText: 'סגור',
      nextBtnText: 'הבא',
      prevBtnText: 'הקודם',
      steps: [
        {
          popover: {
            title: 'ברוך הבא ל-FLM!',
            position: 'bottom',
          },
        },
        {
          element: '.contact',
          popover: {
            title: 'צור קשר',
            description: 'כאן תוכל ליצור איתנו קשר במידה ויש לך שאלות.',
            position: 'top',
          },
        },
        {
          element: '.login-leagues',
          popover: {
            title: auth.length !== 0 ? 'רשימת הליגות' : 'התחברות והרשמה',
            description: auth.length !== 0 ? 'כאן ניתן לראות את רשימת הליגות שבהן אתה נמצא.' : 'כאן ניתן להתחבר או להירשם אם אינך כבר רשום.',
            position: 'top',
          },
        },
      ]
    });
    
    driverObj.drive();
  };

  return (
    <div className="App" data-theme={isDark ? "dark" : "light"}>
      <Logo
        isChecked={isDark}
        handleChange={() => setIsDark(!isDark)}
        auth={auth}
      />
      <Firefly />
      <div className='full-page'>
        <div className='welcom-section'>
          {
            auth.length !== 0 ? (
              <h3 className="divider line glow">
                שלום, {auth.firstName}!
              </h3>
            ) : (
              <h3 className="divider line glow">
                שלום, אורח!
              </h3>
            )
          }
          <section>
            <h1 className='app-title'>ברוך הבא ל-FLM!</h1>
            <p>
              האפליקציה שלנו נועדה לחובבי כדורגל במשחקים כמו FIFA ו-PES, המאפשרת לכם לנהל בקלות טורנירים, ליגות, סטטיסטיקות ועוד.<br />
              תכננו מערכת שתשמור על כל הפרטים במקום אחד – החל מיצירת קבוצות ושחקנים ועד לניהול תוצאות, לוחות זמנים וטבלאות.<br />
              הצטרפו אלינו כדי להפוך כל טורניר לחוויה סוחפת ומקצועית!
            </p>
          </section>
          <button className="button-modern" onClick={startGuide}>
            מדריך אישי
          </button>
        </div>


        <div className='section-50 login-leagues'>
          {
            auth.length !== 0 ? (
              <div>
                <UserLeagues />
              </div>
            ) : (
              <Login />
            )
          }
        </div>
        <Contact className="section-50 contact" />
      </div>
      <Footer />
    </div>
  );
}

export default App;
