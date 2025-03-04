import React, { useEffect, useState } from 'react';
import '../style/LeagueLeaderboard.css'; // קובץ ה-CSS שיכיל את העיצוב
import Pagination from './Pagination';

const Leaderboard = ({ users, postsPerPageNumber, totalUsers }) => {
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = postsPerPageNumber;

  // חישוב נקודות עבור שחקן
  const calculatePoints = (player) => {
    const { firstPlaces, secondPlaces, KOG, KOA } = player;
    return (firstPlaces.length * 4) + (secondPlaces.length * 3) + (KOG.length * 2) + (KOA.length * 1);
  };

  // סידור השחקנים לפי הנקודות
  useEffect(() => {
    const sorted = users
      .map((player) => ({
        ...player,
        points: calculatePoints(player),
      }))
      .sort((a, b) => b.points - a.points); // ממיין בסדר יורד לפי הנקודות
    setSortedPlayers(sorted);
  }, [users]);

  // חישוב השחקנים לתצוגה לפי עמוד
  const indexOfLastPlayer = currentPage * postsPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - postsPerPage;
  const currentPlayers = sortedPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);

  return (
    <div className='leaderboard-center'>
      <div className="leaderboard-container">
        <h1 className="leaderboard-title">דירוג השחקנים</h1>
        {sortedPlayers.length === 0 ? (
          <p>לא נמצאו משתמשים בליגה.</p> // הודעה אם אין שחקנים
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>מיקום</th>
                <th>שחקן</th>
                <th>מקומות ראשונים</th>
                <th>מקומות שניים</th>
                <th>מלך השערים</th>
                <th>מלך הבישולים</th>
                <th>נקודות</th>
              </tr>
            </thead>
            <tbody>
              {currentPlayers.map((player, index) => (
                <tr key={index} className={index === 0 && currentPage === 1 ? 'first-place' : ''}>
                  <td>{indexOfFirstPlayer + index + 1}</td>
                  <td>{player.firstName} {player.lastName}</td>
                  <td>{player.firstPlaces.length}</td>
                  <td>{player.secondPlaces.length}</td>
                  <td>{player.KOG.length}</td>
                  <td>{player.KOA.length}</td>
                  <td>{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* הצגת Pagination רק אם יש יותר מ-3 שחקנים */}
        {sortedPlayers.length > postsPerPage && (
          <Pagination
            totalPosts={sortedPlayers.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
