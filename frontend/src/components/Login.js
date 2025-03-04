import { useEffect, useState } from 'react';
import "../style/Login.css";
import axios from '../api/axios';
import { PulseLoader } from "react-spinners";
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from "react-router-dom";
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext';
import ConfirmModal from './ConfirmModal';
import AuthButton from './AuthButton';
import InfoTooltip from './InfoTooltip';

export const Login = () => {
  const [isChecked, setIsChecked] = useState(true);
  const [isLoding, setIsLoding] = useState(false);
  const [errorValue1, setErrorValue1] = useState(false);
  const [errorValue2, setErrorValue2] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false); // מצב חדש לתנאי השימוש
  const [isModalOpen, setIsModalOpen] = useState(false); // מצב פתיחה/סגירה של המודאל

  const { setAuth } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  let from = location.pathname === '/Login' ? location.pathname : "/";
  if (from === '/Login') {
    from = '/';
  }

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token'); // קבלת הטוקן מ-localStorage
    
      if (!token) {
        return;
      }
    
      try {
        const response = await axios.post('/verify-token', {}, {
          headers: { 'Authorization': `${token}` }
        });
    
        if (response.data && response.data.user) {
          if(response.data.user.verify){
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
            const secondPlaces = response.data.user.secondPlaces;
            const KOG = response.data.user.KOG;
            const KOA = response.data.user.KOA;
            localStorage.setItem('token', token);
            setAuth({ id, email: emailRes, admin, createdLeague, firstName, lastName, profileImage, dateOfBirth, gender, leaguesId, tournamentsId, firstPlaces, secondPlaces, KOG, KOA})
            navigate(from, { replace: true })
        } else {
          localStorage.removeItem('token'); // Remove token from localStorage
          setAuth([]); // Clear auth state
        }
        } 
      } catch (error) {
        localStorage.removeItem('token'); // Remove token from localStorage
        setAuth([]); // Clear auth state
        console.error('Token verification failed:', error);
      }
    };
    
    checkToken();
  }, [from, navigate, setAuth]);

  //handle login
  const [loginValues, setLoginValues] = useState({
    email: "",
    password: "",
  });

  const regEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;

  const handleEmailLogin = (event) => {
    setIsChecked(true);
    setLoginValues({...loginValues, email: event.target.value });
  }

  const handlePasswordLogin = (event) => {
    setIsChecked(true);
    setLoginValues({...loginValues, password: event.target.value });
  }

  const handleLoginSubmitted = async (event) => {
    if (regEmail.test(loginValues.email)) {
      setErrorValue1(false);
      setIsLoding(true);
      try {
        await axios.post('/login', {
          email: loginValues.email.toLowerCase(),
          password: loginValues.password,
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((res) => {
            if (res.data) {
                setIsLoding(false)
            if(res.data.message === 'נדרש לאמת את המשתמש במייל') {
                addToast({ id: Date.now(), message: 'נדרש לאמת את המשתמש במייל', type: 'error' });
            }
            if(res.data.user.verify){
                const token = res.data.token;
                const admin = res.data.user.admin;
                const createdLeague = res.data.user.createdLeague;
                const id = res.data.user._id;
                const emailRes = res.data.user.email;
                const firstName = res.data.user.firstName;
                const lastName = res.data.user.lastName;
                const profileImage = res.data.user.profileImage;
                const dateOfBirth = res.data.user.dateOfBirth;
                const gender = res.data.user.gender;
                const leaguesId = res.data.user.leaguesId;
                const tournamentsId = res.data.user.tournamentsId;
                const firstPlaces = res.data.user.firstPlaces;
                const secondPlaces = res.data.user.secondPlaces;
                const KOG = res.data.user.KOG;
                const KOA = res.data.user.KOA;
                localStorage.setItem('token', token);
                setAuth({ id, email: emailRes, admin, createdLeague, firstName, lastName, profileImage, dateOfBirth, gender, leaguesId, tournamentsId, firstPlaces, secondPlaces, KOG, KOA})
                navigate(from, { replace: true })
            }
          }
        });
      } catch (err) {
        if (err.response) {
          addToast({ id: Date.now(), message: 'אחד מהפרטים שגוי!', type: 'error' });
          setIsLoding(false);
          setErrorValue1(true);
        }
      }
    } else {
      addToast({ id: Date.now(), message: 'אחד מהפרטים שגוי!', type: 'error' });
      setIsLoding(false);
      setErrorValue1(true);
    }
  }

  //handle register
  const [registerValues, setRegisterValues] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const separateWords = (str) => {
    return str.split(' ').length === 2;
  }

  const handleEmailRegister = (event) => {
    setIsChecked(false);
    setRegisterValues({...registerValues, email: event.target.value });
  }

  const handleFullNameRegister = (event) => {
    setIsChecked(false);
    setRegisterValues({...registerValues, fullName: event.target.value });
  }

  const handlePasswordRegister = (event) => {
    setIsChecked(false);
    setRegisterValues({...registerValues, password: event.target.value });
  }

  const handleRegisterSubmitted = async (event) => {
    event.preventDefault(); // למנוע את ברירת המחדל של שליחת הטופס
    if (!acceptTerms) {
        setErrorValue2(true);
        addToast({ id: Date.now(), message: 'עליך להסכים לתנאי השימוש כדי להירשם.', type: 'error' });
        return; // לא לשלוח בקשה אם תנאי השימוש לא סומנו
    }

    if(registerValues.fullName.split(' ')[0].length <= 2 || registerValues.fullName.split(' ')[1].length <= 2){
      setErrorValue2(true);
      addToast({ id: Date.now(), message: 'שם פרטי או שם משפחה חייבים להיות 2 תווים לפחות.', type: 'error' });
      return; // לא לשלוח בקשה אם הסיסמה קצרה מדי
    }

    if (regEmail.test(registerValues.email) && separateWords(registerValues.fullName)) {

      // הוספת בדיקת אורך הסיסמה
      if (registerValues.password.length < 6) {
        setErrorValue2(true);
        addToast({ id: Date.now(), message: 'הסיסמה חייבת להכיל לפחות 6 תווים.', type: 'error' });
        return; // לא לשלוח בקשה אם הסיסמה קצרה מדי
      }
      setErrorValue2(false);
      setIsLoding(true);
      const host = window.location.host;
      const protocol = window.location.protocol;
      try {
        await axios.post('/register', {
          email: registerValues.email.toLowerCase(),
          password: registerValues.password,
          firstName: registerValues.fullName.split(' ')[0],
          lastName: registerValues.fullName.split(' ')[1],
          protocol: protocol,
          webSite: host,
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((res) => {
          if (res.data) {
            setIsLoding(false);
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
            addToast({ id: Date.now(), message: 'נשלח לך מייל לאישור המשתמש', type: 'success' });
            navigate(from, { replace: true });
          }
        });
      } catch (err) {
        if (err.response) {
          addToast({ id: Date.now(), message: 'אחד מהפרטים שגוי!', type: 'error' });
          setIsLoding(false);
          setErrorValue2(true);
        }
      }
    } else {
      addToast({ id: Date.now(), message: 'אחד מהפרטים שגוי!', type: 'error' });
      setIsLoding(false);
      setErrorValue2(true);
    }
  }
    // פונקציה לטיפול בשכחת סיסמה
  const handleForgotPassword = async () => {
    if (regEmail.test(loginValues.email)) {
      setIsLoding(true);
      const host = window.location.host;
      const protocol = window.location.protocol;
      try {
        await axios.post('/forgot-password', {
          email: loginValues.email.toLowerCase(),
          protocol,
          webSite: host,
          headers: {
            'Content-Type': 'application/json',
          }
        }).then((res) => {
          if (res.data.message === 'מייל לאיפוס סיסמה נשלח בהצלחה') {
            addToast({ id: Date.now(), message: 'מייל לאיפוס סיסמה נשלח בהצלחה', type: 'success' });
          }
          setIsLoding(false);
        });
      } catch (err) {
        if (err.response) {
          addToast({ id: Date.now(), message: 'שגיאה בשליחת מייל', type: 'error' });
        }
        setIsLoding(false);
      }
    } else {
      addToast({ id: Date.now(), message: 'נא להזין אימייל תקין', type: 'error' });
    }
  }

  return (
    <div className="container-login">
        <div>
          <AuthButton setErrorValue1={setErrorValue1} setIsLoding={setIsLoding} setAuth={setAuth} navigate={navigate} from={from} addToast={addToast}/>
        </div>
      <input
        type="radio" 
        name="tab" 
        id="signin" 
        checked={isChecked}
        onChange={() => setIsChecked(true)}
      />
      <input 
        type="radio" 
        name="tab" 
        id="register" 
        onChange={() => setIsChecked(false)}
      />
      <div className="pages">
        {/* טופס התחברות */}
        <form className="page" onSubmit={(e) => { e.preventDefault(); handleLoginSubmitted(); }}>
          <div className="input">
            <div className="title"><i className="material-icons"></i> אימייל</div>
            <input 
              className="text" 
              type="email" 
              name='email'
              value={loginValues.email} 
              onChange={handleEmailLogin} 
              autoComplete="email"
            />
          </div>
          <div className="input">
            <div className="title"><i className="material-icons"></i> סיסמה</div>
            <input 
              className="text" 
              type="password" 
              value={loginValues.password}  
              onChange={handlePasswordLogin} 
              autoComplete="true"
            />
          </div>
          <div className="input">
            <div className="title" onClick={() => {setIsModalOpen(true)}} style={{cursor: 'pointer'}}>
              <i className="material-icons"></i> שכחת סיסמה?
            </div>
            <ConfirmModal
                isOpen={isModalOpen}
                customMSG={'האם באמת שכחת סיסמה?'}
                onConfirm={() => { handleForgotPassword(); setIsModalOpen(false); }} // מאשר מחיקה
                onCancel={() => setIsModalOpen(false)} // מבטל את המחיקה
            />
          </div>
          <div className="input">
            {isLoding ? 
              <PulseLoader className="contact-loading" color="var(--primary-text-color)" /> : 
              <input type="submit" value="התחבר" />
            }
            {errorValue1 ? <p style={{color: 'var(--dangerous-color)', margin: '1%'}}>אחד מהפרטים שגוי!</p> : null}
          </div>
        </form>
    
        {/* טופס הרשמה */}
        <form className="page signup" onSubmit={handleRegisterSubmitted}>
          <div className="input">
            <div className="title"><InfoTooltip message="שם מלא חייב להיות שם פרטי ושם משפחה בלבד בכל אחד מהם לפחות 2 תווים." /> שם מלא</div>
            <input 
              className="text" 
              type="text" 
              name="fullname" 
              value={registerValues.fullName} 
              onChange={handleFullNameRegister} 
              autoComplete="name"
            />
          </div>
          <div className="input">
            <div className="title"><InfoTooltip message="אימייל חייב להיות דואר אלקטרוני תקין." /> אימייל</div>
            <input 
              className="text" 
              type="email" 
              name='email' 
              value={registerValues.email} 
              onChange={handleEmailRegister} 
              autoComplete="email"
            />
          </div>
          <div className="input">
            <div className="title"><InfoTooltip message="סיסמה חייב להיות לפחות 6 תווים." /> סיסמה</div>
            <input 
              className="text" 
              type="password" 
              value={registerValues.password} 
              onChange={handlePasswordRegister} 
              autoComplete="false"
            />
          </div>
          <div className="input">
            <div className="checkbox-wrapper-13">
              <input
                className="admin-status"
                id="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={() => setAcceptTerms(!acceptTerms)} // שינוי סטטוס תנאי השימוש
              />
              <label htmlFor="accept-terms">אני מסכים <Link to='/terms-of-service'>לתנאי השימוש</Link></label>
            </div>
          </div>
          <div className="input">
            {isLoding ? 
              <PulseLoader className="contact-loading" color="var(--primary-text-color)" /> : 
              <input type="submit" value="הירשם!" />
            }
            {errorValue2 ? <p style={{color: 'var(--dangerous-color)', margin: '1%'}}>אחד מהפרטים שגוי!</p> : null}
          </div>
        </form>
      </div>

      <div className="tabs">
        <label className="tab" htmlFor="signin">
          <div className="text">התחברות</div>
        </label>
        <label className="tab" htmlFor="register">
          <div className="text">הרשמה</div>
        </label>
      </div>
    </div>
  );
};
