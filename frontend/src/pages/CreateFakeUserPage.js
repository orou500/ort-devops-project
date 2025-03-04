import React, { useState } from 'react';
import '../style/CreateFakeUserPage.css';
import { Logo } from '../components/Logo';
import useLocalStorage from 'use-local-storage';
import { useAuth } from '../hooks/useAuth';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import confetti from 'canvas-confetti';
import { useToast } from '../context/ToastContext';

const CreateFakeUserPage = () => {

  const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDark, setIsDark] = useLocalStorage("darkMode", preference);

  const { auth } = useAuth();
  const { addToast } = useToast();
  const { LeaguesSlug } = useParams(); // קבלת מזהה הליגה מה-URL אם ישנו
  const [fakeUser, setFakeUser] = useState({
      firstName: '',
      lastName: '',
      gender: 'male',
      tournamentsId: [],
      firstPlaces: [],
      secondPlaces: [],
      KOG: [],
      KOA: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // עדכון שדות הקלט
  const handleChange = (e) => {
      const { name, value } = e.target;
      setFakeUser({ ...fakeUser, [name]: value });
  };

  // שליחת הטופס לשרת
  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      try {
        await axios.post(`${LeaguesSlug}/fakeusers`, fakeUser, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${token}`, // אם יש צורך ב-Bearer token
            }
        });
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          addToast({ id: Date.now(), message: 'משתמש מדומה נוסף בהצלחה!', type: 'success' });
          setFakeUser({
              firstName: '',
              lastName: '',
              gender: 'male',
              tournamentsId: [],
              firstPlaces: [],
              secondPlaces: [],
              KOG: [],
              KOA: [],
          });
      } catch (error) {
          setError(error.response?.data?.message || "הוספת משתמש מדומה נכשלה");
      } finally {
          setLoading(false);
      }
  };
  
  return (
      <div className='create-fake-user-page' data-theme={isDark ? "dark" : "light"}>
        <Logo 
          isChecked={isDark}
          handleChange={() => setIsDark(!isDark)}
          auth={auth}
        />
        <div className='create-fake-user-body'>
          <h1 className='title-fake-user'>הוספת משתמש מדומה לליגה</h1>
          <div className='container-fake-user'>
            {error && <p className="error-message">{error}</p>}
            <form className="form-fake-user" onSubmit={handleSubmit}>
                <div className="input-wrapper-fake-user">
                    <label className="label-fake-user">שם פרטי:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={fakeUser.firstName}
                        onChange={handleChange}
                        required
                        className="input-fake-user"
                    />
                </div>
                <div className="input-wrapper-fake-user">
                    <label className="label-fake-user">שם משפחה:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={fakeUser.lastName}
                        onChange={handleChange}
                        required
                        className="input-fake-user"
                    />
                </div>
                <div className="input-wrapper-fake-user">
                    <label className="label-fake-user">מגדר:</label>
                    <select
                        name="gender"
                        value={fakeUser.gender}
                        onChange={handleChange}
                        className="input-fake-user"
                    >
                        <option value="male">זכר</option>
                        <option value="female">נקבה</option>
                        <option value="other">אחר</option>
                    </select>
                </div>
                <button type="submit" className="submit-button-fake-user" disabled={loading}>
                    {loading ? 'מוסיף...' : 'הוסף משתמש מדומה'}
                </button>
            </form>
          </div>
        </div>
      </div>
  );
}

export default CreateFakeUserPage;