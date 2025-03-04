import { Link } from "react-router-dom";
import "../style/LeagueCard.css";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../hooks/useAuth";
import axios from "../api/axios";
import ConfirmModal from "./ConfirmModal";
import { useEffect, useState } from "react";
import { AnimatedCounter } from "react-animated-counter";

export const LeagueCard = ({league, currentLeagues, leagues, setLeagues}) => {

    const { addToast } = useToast();
    const { auth } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // מצב פתיחה/סגירה של המודאל

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const handleReset = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.delete(`/leagues/${league.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`,
                }
            });
    
            if (response.status === 200) {
                currentLeagues = currentLeagues.filter(l => l.slug !== league.slug);
                const updatedLeagues = leagues.filter(l => l.slug !== league.slug);
        
                setLeagues(updatedLeagues);
                addToast({ id: Date.now(), message: 'נתוני הליגה נמחקו בהצלחה', type: 'success' });
            }
            
        } catch (error) {
            addToast({ id: Date.now(), message: 'שגיאה במחיקת הליגה', type: 'error' });
        }
    };

    useEffect(() => {
        if (auth.id && league.adminsId) {
          setIsAdmin(league.adminsId.includes(auth.id));
        }
      }, [auth, league]);
    

    return (
        <div className="card-continer">
        <Link to={`/leagues/${league.slug}`} className="card-link">
          <div className="card-sec-bg"></div>
  
          <div className="card-title">
            {league.title}
          </div>
          <div className="card-box">
            <p>כמות משחקים:</p> 
            <span className="card-item">
              <AnimatedCounter className="card-item" value={league.tournamentsCount} includeDecimals={false}/>
            </span>
          </div>
          <div className="card-box">
            <p>כמות שחקנים:</p> 
            <span className="card-item">
              <AnimatedCounter className="card-item" value={league.usersCount} includeDecimals={false}/>
            </span>
          </div>
          <div className="card-box">
            תאריך יצירה:
            <span className="card-item">
              {formatDate(league.createdAt)}
            </span>
          </div>
          <div className="card-box">
            <span className="card-item">
            </span>
          </div>
        </Link>
        {
            auth.admin || isAdmin? (
                <>
                    <button className="btn btn-cancel" type="button" onClick={() => {setIsModalOpen(true)}}>
                        מחיקה
                    </button>
                    <ConfirmModal
                        isOpen={isModalOpen}
                        onConfirm={() => { handleReset(); setIsModalOpen(false); }} // מאשר מחיקה
                        onCancel={() => setIsModalOpen(false)} // מבטל את המחיקה
                    />
                </>
        ) : <></>
        }
      </div>
    );
  };