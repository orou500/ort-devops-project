// OddKnockoutBracket.js
import React, { useState, useEffect } from 'react';
import '../style/OddKnockoutBracket.css';
import { useToast } from '../context/ToastContext';
import TournamentBracket from './TournamentBracket'; // ייבוא הקומפוננטה
//import NewTournamentBracket from './NewTournamentBracket';

const MAX_MATCHES = {
  "שמינית גמר": 8,
  "רבע גמר": 4,
  "חצי גמר": 2,
  "גמר": 1
};

const OddKnockoutBracket = ({ users, KnockoutType, tournamentData, setTournamentData }) => {
  const { addToast } = useToast();
  const stageNames = ['שמינית גמר', 'רבע גמר', 'חצי גמר', 'גמר'];
  const knockoutIndex = stageNames.indexOf(KnockoutType);
  const availableStages = stageNames.slice(knockoutIndex);
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [chosenTeams, setChosenTeams] = useState(new Set());

  useEffect(() => {
    if (stageIndex > 0 && tournamentData[stageIndex - 1].length > 0) {
      const winners = getWinnersFromPreviousStage(tournamentData[stageIndex - 1]);
      setSelectedTeam1(winners[0] || '');
      setSelectedTeam2(winners[1] || '');
    }
  }, [tournamentData, stageIndex]);

  const getWinnersFromPreviousStage = (previousStageData) => {
    let winners = [];
    previousStageData.forEach(match => {
      if (match.score1 > match.score2) {
        winners.push(match.team1);
      } else if (match.score2 > match.score1) {
        winners.push(match.team2);
      } else {
        winners.push(match.team1);
        winners.push(match.team2);
      }
    });
    return winners;
  };

  const addMatch = (team1, team2, score1, score2) => {
    const stageName = availableStages[stageIndex];

    if (stageIndex < 0 || stageIndex >= availableStages.length) {
      addToast({ id: Date.now(), message: 'שלב לא תקין.', type: 'error' });
      return;
    }

    if (tournamentData[knockoutIndex + stageIndex].length < MAX_MATCHES[stageName]) {
      setTournamentData(prevData => {
        const newData = [...prevData];
        newData[knockoutIndex + stageIndex] = [...newData[knockoutIndex + stageIndex], { team1, team2, score1, score2 }];
        return newData;
      });

      // הוספת הקבוצות שנבחרו ל-set
      chosenTeams.add(team1);
      chosenTeams.add(team2);
      setChosenTeams(new Set(chosenTeams));

      // נקה את שדות הקלט
      setTeam1('');
      setTeam2('');
      setScore1(0);
      setScore2(0);
      setSelectedTeam1('');
      setSelectedTeam2('');
    } else {
      addToast({ id: Date.now(), message: `לא ניתן להוסיף עוד משחק לשלב ${stageName}.`, type: 'error' });
    }
  };

  const handleAddMatch = () => {
    if (stageIndex === 0) {
      if (team1 && team2 && score1 >= 0 && score2 >= 0 && team1 !== team2) {
        addMatch(team1, team2, score1, score2);
      } else {
        addToast({ id: Date.now(), message: 'אנא בחר את שתי הקבוצות ותוצאות תקינות (והימנע מבחירת אותה קבוצה פעמיים).', type: 'error' });
      }
    } else {
      if (selectedTeam1 && selectedTeam2 && score1 >= 0 && score2 >= 0 && selectedTeam1 !== selectedTeam2) {
        addMatch(selectedTeam1, selectedTeam2, score1, score2);
      } else {
        addToast({ id: Date.now(), message: 'אנא בחר את שתי הקבוצות והזן תוצאות (והימנע מבחירת אותה קבוצה פעמיים).', type: 'error' });
      }
    }
  };

  const handleDeleteMatch = (roundIndex, matchIndex) => {
    const updatedTournamentData = [...tournamentData];

    updatedTournamentData[knockoutIndex + roundIndex] = updatedTournamentData[knockoutIndex + roundIndex].filter(
      (match, index) => index !== matchIndex
    );

    updatedTournamentData[knockoutIndex + roundIndex].forEach(match => {
      chosenTeams.delete(match.team1);
      chosenTeams.delete(match.team2);
    });
    setChosenTeams(new Set(chosenTeams));

    setTournamentData(updatedTournamentData);
  };

  return (
    <div className="tournament-container">
      <h2 className='add-games-tournament'>הוספת משחק לטורניר</h2>
      {stageIndex === 0 ? (
        <>
          <label className='select-teams-tournament'>בחר קבוצה 1:</label>
          <select value={team1} onChange={(e) => setTeam1(e.target.value)}>
            <option value="">בחר קבוצה 1</option>
            {users.filter(user => `${user.firstName} ${user.lastName}` !== team2).map((user, index) => (
              <option key={`${user}-${index}`} value={`${user.firstName} ${user.lastName}`}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
          <label>בחר קבוצה 2:</label>
          <select value={team2} onChange={(e) => setTeam2(e.target.value)}>
            <option value="">בחר קבוצה 2</option>
            {users.filter(user => `${user.firstName} ${user.lastName}` !== team1).map((user, index) => (
              <option key={`${user}-${index}`} value={`${user.firstName} ${user.lastName}`}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <label className='select-teams-tournament'>בחר קבוצה 1:</label>
          <select value={selectedTeam1} onChange={(e) => setSelectedTeam1(e.target.value)}>
            <option value="">בחר קבוצה 1</option>
            {tournamentData[knockoutIndex + stageIndex - 1].length > 0 && 
              getWinnersFromPreviousStage(tournamentData[knockoutIndex + stageIndex - 1])
                .filter(team => team !== selectedTeam2)
                .map((team, index) => (
                  <option key={index} value={team}>{team}</option>
                ))
            }
          </select>
          <label>בחר קבוצה 2:</label>
          <select value={selectedTeam2} onChange={(e) => setSelectedTeam2(e.target.value)}>
            <option value="">בחר קבוצה 2</option>
            {tournamentData[knockoutIndex + stageIndex - 1].length > 0 &&
              getWinnersFromPreviousStage(tournamentData[knockoutIndex + stageIndex - 1])
                .filter(team => team !== selectedTeam1)
                .map((team, index) => (
                  <option key={index} value={team}>{team}</option>
                ))
            }
          </select>
        </>
      )}
      <label className='result-game-team-1'>תוצאה קבוצה 1:</label>
      <input
        type="number"
        value={score1}
        onChange={(e) => setScore1(Number(e.target.value))}
        placeholder="תוצאה קבוצה 1"
      />
      <label>תוצאה קבוצה 2:</label>
      <input
        type="number"
        value={score2}
        onChange={(e) => setScore2(Number(e.target.value))}
        placeholder="תוצאה קבוצה 2"
      />
      <label>בחר שלב:</label>
      <select value={stageIndex} onChange={(e) => setStageIndex(Number(e.target.value))} className='select-tournament-level'>
        {availableStages.map((stage, index) => (
          <option key={index} value={index}>{stage}</option>
        ))}
      </select>

      <button className='add-match' onClick={handleAddMatch}>הוסף משחק</button>

      <h3>נתוני טורניר:</h3>
      {/* כאן אנחנו מוסיפים את הקומפוננטה TournamentBracket */}
      <TournamentBracket 
        availableStages={availableStages} 
        tournamentData={tournamentData} 
        knockoutIndex={knockoutIndex} 
        handleDeleteMatch={handleDeleteMatch} 
      />
      {/*<NewTournamentBracket 
        availableStages={availableStages} 
        tournamentData={tournamentData} 
        knockoutIndex={knockoutIndex} 
        handleDeleteMatch={handleDeleteMatch} 
      />*/}
    </div>
  );
};

export default OddKnockoutBracket;
