// TournamentBracket.js
import React from 'react';
import '../style/TournamentBracket.css';


const TournamentBracket = ({ availableStages, tournamentData, knockoutIndex, handleDeleteMatch }) => {

  if (!tournamentData || tournamentData.length === 0) {
    return <p>לא קיימים משחקים בטורניר הזה.</p>;
  }

  return (
    <div className="tournament-bracket">
      {availableStages.map((round, index) => (
        <div key={index} className={`round round-${index}`}>
          <h4>{round}</h4>
          {tournamentData[knockoutIndex + index].map((match, matchIndex) => (
            <div key={matchIndex} className="match">
              <div className="team">
                <span>{match.team1}</span>
                <input type="number" value={match.score1} readOnly />
              </div>
              <span className="vs">vs</span>
              <div className="team">
                <span>{match.team2}</span>
                <input type="number" value={match.score2} readOnly />
              </div>
              {
                handleDeleteMatch ? (
                  <button 
                    onClick={() => handleDeleteMatch(index, matchIndex)} // כפתור מחיקה
                    className="delete-match-button"
                  >
                    מחק משחק
                  </button>
                ) : <></>
              }
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default TournamentBracket;
