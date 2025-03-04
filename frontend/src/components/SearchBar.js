import { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useParams } from "react-router-dom"; // לשימוש בליגה הספציפית
import "../style/SearchBar.css";
import axios from "../api/axios";
import { useToast } from "../context/ToastContext";

export const SearchBar = ({ setResults, auth, setIsLoading, searchInLeague }) => {
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const { LeaguesSlug } = useParams(); // מזהה הליגה מה-URL
  const { addToast } = useToast();

  // debounce effect: לעדכן את debouncedTerm רק אחרי 500 מילישניות
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId); // לנקות את הטיימר כדי למנוע בקשות מרובות
    };
  }, [searchTerm]);

  // קריאת ה-API עם debouncedTerm
  useEffect(() => {
    const handleGetUsers = async () => {
      if (debouncedTerm) {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
          let response;
          if (searchInLeague && LeaguesSlug) {
            // חיפוש משתמשים רק מהליגה
            response = await axios.get(`/leagues/${LeaguesSlug}/users`, {
              headers: {
                "Content-Type": "application/json",
                'Authorization': `${token}`,
              },
            });
          } else {
            // חיפוש כללי של משתמשים במערכת
            response = await axios.get("/users", {
              headers: {
                "Content-Type": "application/json",
                'Authorization': `${token}`,
              },
            });
          }
  
          if (response.data) {
            const results = response.data.filter((user) => {
              // שמות פרטיים ושמות משפחה צריכים להיות באותיות קטנות לחיפוש
              const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
              const lowerSearchTerm = debouncedTerm.toLowerCase(); // הוספת המונח לחיפוש באותיות קטנות
              return (
                (user.email && user.email.toLowerCase().includes(lowerSearchTerm)) || // חיפוש לפי אימייל
                fullName.includes(lowerSearchTerm) // חיפוש לפי שם מלא
              );
            });
            setResults(results);
          }
        } catch (err) {
          if (err.response) {
            addToast({ id: Date.now(), message: 'שגיאה במשיכת משתמשים', type: 'error' });
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsLoading(false);
      }
    };
  
    handleGetUsers();
  }, [debouncedTerm, auth.token, addToast, searchInLeague, LeaguesSlug, setResults, setIsLoading]);
  

  const handleChange = (value) => {
    setInput(value);
    setIsLoading(true);
    setSearchTerm(value); // עדכון searchTerm עם הערך החדש
  };

  return (
    <div className="input-wrapper">
      <FaSearch id="search-icon" />
      <input
        placeholder="הוסף משתמשים..."
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};
