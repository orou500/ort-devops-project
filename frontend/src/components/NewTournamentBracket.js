import React from 'react';
import '../style/NewTournamentBracket.css';

const getStageClassName = (stage) => {
  switch (stage) {
    case "Round of 16":
      return "round-of-16"; // השתמש ב-class המתאים לשמינית גמר
    case "רבע גמר":
      return "quarterfinals";
    case "חצי גמר":
      return "semifinals";
    case "גמר":
      return "finals";
    default:
      return "";
  }
};

const NewTournamentBracket = ({ availableStages, tournamentData, knockoutIndex, handleDeleteMatch }) => {
  return (
    <div className="bracket">
      {availableStages.map((stage, stageIndex) => (
        <section key={stageIndex} className={`round ${getStageClassName(stage)}`}>
          <h3>{stage}</h3>
          {tournamentData[knockoutIndex + stageIndex]
            .reduce((result, match, index) => {
              // יוצר מערך עם קבוצות של שני משחקים בכל קבוצה
              if (index % 2 === 0) result.push([]);
              result[result.length - 1].push(match);
              return result;
            }, [])
            .map((matchGroup, groupIndex, matchGroups) => (
              <div key={groupIndex} className="winners">
                <div className="matchups">
                  {matchGroup.map((match, matchIndex) => (
                    <div key={matchIndex} className="matchup">
                      <div className="participants">
                        <div className={`participant ${match.score1 > match.score2 ? 'winner' : ''}`}>
                          <span>{match.team1}</span>
                          <span>{match.score1}</span>
                        </div>
                        <div className={`participant ${match.score2 > match.score1 ? 'winner' : ''}`}>
                          <span>{match.team2}</span>
                          <span>{match.score2}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMatch(stageIndex, matchIndex)}
                        className="matchup-delete-button"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                {/* מוסיף connector אחרי כל קבוצת winners למעט הקבוצה האחרונה */}
                {groupIndex < matchGroups.length && stage !== "גמר" && (
                  <div className="connector">
                    <div className="merger"></div>
                    <div className="line"></div>
                  </div>
                )}
              </div>
            ))}
        </section>
      ))}
    </div>
  );
};

export default NewTournamentBracket;
