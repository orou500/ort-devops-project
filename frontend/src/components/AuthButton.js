// AuthButton.js או רכיב אחר
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { apiUrl } from "../data/contentOption"
import { FcGoogle } from "react-icons/fc";

const AuthButton = ({ setAuth, navigate }) => {
  const location = useLocation();


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);

      // בקשת פרטי המשתמש
      axios.get('/user/profile', {
        headers: { 'Authorization': `${token}` }
      }).then(res => {
        const admin = res.data.admin;
        const createdLeague = res.data.createdLeague;
        const id = res.data._id;
        const emailRes = res.data.email;
        const firstName = res.data.firstName;
        const lastName = res.data.lastName;
        const profileImage = res.data.profileImage;
        const dateOfBirth = res.data.dateOfBirth;
        const gender = res.data.gender;
        const leaguesId = res.data.leaguesId;
        const tournamentsId = res.data.tournamentsId;
        const firstPlaces = res.data.firstPlaces;
        const secondPlaces = res.data.secondPlaces;
        const KOG = res.data.KOG;
        const KOA = res.data.KOA;
        localStorage.setItem('token', token);
        setAuth({ id, email: emailRes, admin, createdLeague, firstName, lastName, profileImage, dateOfBirth, gender, leaguesId, tournamentsId, firstPlaces, secondPlaces, KOG, KOA})
        navigate('/', { replace: true });
      }).catch(error => console.error(error));
    }
  }, [location, navigate, setAuth]);

  const handleLogin = () => {
    const redirectUri = window.location.href; // הכתובת הנוכחית שממנה מגיע המשתמש
    window.location.href = `${apiUrl.API_BASE_URL_DEV}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };
  

  return (
    <div>
      <button onClick={handleLogin} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--foreground-color)', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', marginBottom: '1vh' }}>
        <FcGoogle alt="Google Logo" style={{ width: '20px', height: '20px', marginRight: '10px' }} />
        התחבר באמצעות גוגל
      </button>
    </div>
  );
};

export default AuthButton;
