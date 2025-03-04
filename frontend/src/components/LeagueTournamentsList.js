import React, { useEffect, useState } from 'react';
import "../style/LeagueTournamentList.css";
import Pagination from './Pagination';
import { useToast } from "../context/ToastContext";
import { Link } from 'react-router-dom';
import axios from '../api/axios'; // נשתמש ב-axios לביצוע בקשת המחיקה
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../hooks/useAuth';

const LeagueTournamentsList = ({ tournaments, postsPerPageNumber, totalTournaments, leagueSlug, setLeague, league }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false); // מצב פתיחה/סגירה של המודאל
  const { auth } = useAuth();
  const { addToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null); // משחק שנבחר למחיקה

  const lastPostIndex = currentPage * postsPerPageNumber;
  const firstPostIndex = lastPostIndex - postsPerPageNumber;
  const currentTournament = tournaments.slice(firstPostIndex, lastPostIndex);

  // פונקציה שמבצעת מחיקה של משחק
  const handleDelete = async (tournament) => {
      try {
        const token = localStorage.getItem('token'); // נניח שיש אסימון אימות
        await axios.delete(`/leagues/${leagueSlug}/tournaments/${tournament.slug}`, {
          headers: {
            'Authorization': `${token}`
          }
        });

        // קריאה לפונקציה שמעדכנת את רשימת המשחקים לאחר המחיקה
        setLeague(prevLeague => ({
          ...prevLeague,
          tournaments: prevLeague.tournaments.filter(oldTournament => oldTournament.slug !== tournament.slug) // עדכון רשימת המשחקים
        }));
        addToast({ id: Date.now(), message: 'נתוני הטורניר נמחקו בהצלחה', type: 'success' });
      } catch (error) {
        addToast({ id: Date.now(), message: 'שגיאה במחיקת המשחק', type: 'error' });
      }
  };

  useEffect(() => {
    if (auth.id && league.adminsId) {
      setIsAdmin(league.adminsId.includes(auth.id));
    }
  }, [auth, league]);

  return (
    <div className='league-tournaments'>
      <h2>טורנירים בליגה:</h2>
      
      {tournaments.length === 0 ? (
        <p>אין טורנירים בליגה</p>
      ) : (
        <ul className="tournaments-list">
          {currentTournament.map((tournament) => (
            <div key={tournament._id} className="tournament-card">
              <Link to={`/leagues/${leagueSlug}/tournaments/${tournament.slug}`} className="tournament-link">
                <div className="tournament-info">
                  <span className="tournament-title">{tournament.title}</span>
                </div>
                <div className="tournament-info">
                  <span className="tournament-teams">עוד שדה</span>
                </div>
                <div className="tournament-info">
                  <span className="tournament-date">{new Date(tournament.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
              {
                auth.admin || isAdmin ? (
                  <>
                    <button 
                      className="btn btn-cancel" 
                      onClick={() => { setSelectedTournament(tournament); setIsModalOpen(true); }}>
                      מחק
                    </button>
                    <ConfirmModal
                      isOpen={isModalOpen}
                      onConfirm={() => { handleDelete(selectedTournament); setIsModalOpen(false); }} // מאשר מחיקה של המשחק שנבחר
                      onCancel={() => setIsModalOpen(false)} // מבטל את המחיקה
                    />
                  </>
                ) : null
              }
            </div>
          ))}
        </ul>
      )}

      {totalTournaments > postsPerPageNumber && (
        <Pagination
          totalPosts={totalTournaments}
          postsPerPage={postsPerPageNumber}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </div>
  );
};

export default LeagueTournamentsList;
