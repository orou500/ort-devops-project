import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../style/EditProfilePage.css";
import { useAuth } from '../hooks/useAuth';
import axios from '../api/axios';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import useLocalStorage from 'use-local-storage';
import { useToast } from '../context/ToastContext';

const EditProfilePage = () => {
    const { auth, setAuth } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const preference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [isDark, setIsDark] = useLocalStorage("darkMode", preference);
    const thisDay = new Date().toISOString().split('T')[0];

    // State to hold form data
    const [formData, setFormData] = useState({
        firstName: auth.firstName || '',
        lastName: auth.lastName || '',
        dateOfBirth: auth.dateOfBirth ? new Date(auth.dateOfBirth).toISOString().split('T')[0] : '',
        gender: auth.gender || '',
        age: '', // נחשב את הגיל כאן
        profileImage: auth.profileImage || '', // שדה חדש לתמונת פרופיל
    });

    // State to handle form submission and error
    const [error, setError] = useState('');

    // Function to calculate age based on date of birth
    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Validate image URL
    const isValidImageUrl = (url) => {
        const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\s]*)?$/i;
        const imagePattern = /\.(jpeg|jpg|gif|png|bmp|webp)$/i;
    
        return urlPattern.test(url) && imagePattern.test(url);
    };
    
    

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Update form data
        setFormData({ ...formData, [name]: value });

        // If date of birth changes, recalculate age
        if (name === 'dateOfBirth') {
            const age = calculateAge(value);
            setFormData({ ...formData, age, [name]: value });
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.firstName.length < 2 || formData.firstName.length > 10 || 
            formData.lastName.length < 2 || formData.lastName.length > 10) {
            setError('שם פרטי ושם משפחה חייבים להיות בין 2 ל-10 תווים.');
            return;
        }

        if (!isValidImageUrl(formData.profileImage)) {
            addToast({ id: Date.now(), message: 'כתובת ה-URL של התמונה אינה חוקית', type: 'error' });
            setError('יש להזין כתובת URL חוקית לתמונת פרופיל');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`/users/${auth.id}/edit`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                }
            });
            
            // Update the auth context with new data
            setAuth({ ...auth, ...response.data.user });
            localStorage.setItem('token', response.data.token);
            addToast({ id: Date.now(), message: 'משתמש עודכן בהצלחה', type: 'success' });
            navigate(`/profile`); // Redirect to profile page
        } catch (err) {
            addToast({ id: Date.now(), message: `${err}`, type: 'error' });
            setError('שגיאה בעדכון הפרופיל');
        }
    };

    return (
        <div className="edit-profile-page" data-theme={isDark ? "dark" : "light"}>
            <Logo 
                isChecked={isDark}
                handleChange={() => setIsDark(!isDark)}
                auth={auth}
            />
            <div className='edit-profile-body'>
                <div className="edit-profile-container">
                    <h2>ערוך פרופיל</h2>
                    <form onSubmit={handleSubmit} className="edit-profile-form">
                        {error && <p className="error-message">{error}</p>}
                        <div className="form-group">
                            <label htmlFor="profileImage">תמונת פרופיל:</label>
                            <input 
                                type="url" 
                                id="profileImage" 
                                name="profileImage" 
                                value={formData.profileImage} 
                                onChange={handleInputChange} 
                                placeholder="הכנס URL של תמונת הפרופיל"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="firstName">שם פרטי:</label>
                            <input 
                                type="text" 
                                id="firstName" 
                                name="firstName" 
                                value={formData.firstName} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">שם משפחה:</label>
                            <input 
                                type="text" 
                                id="lastName" 
                                name="lastName" 
                                value={formData.lastName} 
                                onChange={handleInputChange} 
                                required 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="dateOfBirth">תאריך לידה:</label>
                            <input 
                                type="date" 
                                id="dateOfBirth" 
                                name="dateOfBirth" 
                                value={formData.dateOfBirth} 
                                onChange={handleInputChange}
                                max={thisDay}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="gender">מין:</label>
                            <select 
                                id="gender" 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleInputChange}
                            >
                                <option value="">בחר מין</option>
                                <option value="זכר">זכר</option>
                                <option value="נקבה">נקבה</option>
                                <option value="אחר">אחר</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="save-button">שמור שינויים</button>
                            <button type="button" className="cancel-button" onClick={() => navigate('/profile')}>
                                ביטול
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default EditProfilePage;
