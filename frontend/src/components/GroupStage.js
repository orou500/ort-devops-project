import React, { useEffect, useState } from 'react';
import '../style/GroupStage.css';

const GroupStage = ({ groups, setGroups, users, winners, setWinners }) => {
  const [editedPoints, setEditedPoints] = useState({}); // שמירה של הערכים המוצעים לנקודות

  const handleAddUser = (groupId, userId) => {
    const userToAdd = users.find((user) => user._id === userId);
    if (userToAdd) {
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId && group.teams.length < 4
            ? {
                ...group,
                teams: [...group.teams, { id: userToAdd._id, name: `${userToAdd.firstName} ${userToAdd.lastName}`, points: 0 }], 
              }
            : group
        )
      );
    }
  };

  const handleRemoveUser = (groupId, userId) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              teams: group.teams.filter((team) => team.id !== userId),
            }
          : group
      )
    );
  };

  const handleUpdatePoints = (groupId, userId, newPoints) => {
    setGroups((prevGroups) =>
      prevGroups.map((group) => {
        if (group.id !== groupId) return group;

        const totalPoints = group.teams.reduce((sum, team) => sum + team.points, 0);
        const team = group.teams.find((team) => team.id === userId);
        if (!team) return group;

        // אם הנקודות החדשות לא תקינות (למשל יותר מ-18 או פחות מ-0)
        if (newPoints < 0 || newPoints > 18) {
          alert("הנקודות לא יכולות להיות בטווח בין 0 ל-18.");
          return group;
        }

        // אם סך הנקודות בבית אחרי העדכון חורג מ-36
        if (totalPoints + newPoints - team.points > 36) {
          alert("סך הנקודות בבית לא יכול לעלות על 36.");
          return group;
        }

        return {
          ...group,
          teams: group.teams.map((team) =>
            team.id === userId ? { ...team, points: newPoints } : team
          ),
        };
      })
    );
  };

  const handlePointsChange = (e, groupId, teamId) => {
    
    const newPoints = parseInt(e.target.value, 10) || 0;
    if (editedPoints[`${groupId}-${teamId}`] === newPoints) {
      e.target.value = 0
      return
    }
    setEditedPoints({
      ...editedPoints,
      [`${groupId}-${teamId}`]: newPoints,
    });
    handleUpdatePoints(groupId, teamId, newPoints); // הפעלת עדכון הנקודות
  };

  const getWinner = (group) => {
    if (group.teams.length < 4) return null; // חייבים 4 קבוצות בבית
    const totalPoints = group.teams.reduce((sum, team) => sum + team.points, 0);
    if (totalPoints !== 36) return null; // אם סך הנקודות לא שווה ל-36, אין מנצח
  
    // אם סך הנקודות בבית הוא 36, נמצא את המנצח
    return group.teams.reduce((max, team) =>
      team.points > max.points ? team : max
    );
  };
  

  useEffect(() => {
    const newWinners = groups
      .map((group) => getWinner(group)) // נקבל את המנצח מכל בית
      .filter(Boolean) // מסנן ערכים ריקים
      .map((winner) => {
        const user = users.find((user) => user._id === winner.id);
        return user || null;
      })
      .filter(Boolean); // מסנן מנצחים שלא נמצאו
  
    setWinners((prevWinners) => {
      const isSame = prevWinners.length === newWinners.length &&
        prevWinners.every((prev, index) => prev._id === newWinners[index]._id);
  
      return isSame ? prevWinners : newWinners;
    });
  }, [groups, users, setWinners, winners]);
  

  const selectedUsers = groups.flatMap((group) => group.teams.map((team) => team.id));

  if (!groups.length) return null;

  return (
    <div className="groups-container-wrapper">
      {/* קבוצות */}
      <div className="groups-container">
        {groups.map((group) => (
          <div className="group-card" key={group.id}>
            <h3 className="group-title">בית {group.id}</h3>
            <p className="total-points">
              סך הנקודות בבית: {group.teams.reduce((sum, team) => sum + team.points, 0)}/36
            </p>
            <ul className="group-teams">
              {group.teams.length > 0 ? (
                group.teams.map((team) => (
                  <li key={team.id}>
                    {team.name} - נקודות: 
                    <input
                      type="number"
                      value={editedPoints[`${group.id}-${team.id}`] || team.points}
                      onChange={(e) => handlePointsChange(e, group.id, team.id)}
                      min="0"
                      max="18"
                      style={{ width: '60px', marginLeft: '10px', textAlign: 'center' }}
                    />
                    <div className="team-actions">
                      <button
                        className="red-button"
                        onClick={() => handleRemoveUser(group.id, team.id)}
                      >
                        הסר
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="no-teams">לא נוספו קבוצות</li>
              )}
            </ul>
            <div className="group-actions">
              {group.teams.length < 4 && (
                <select
                  onChange={(e) =>
                    e.target.value && handleAddUser(group.id, e.target.value)
                  }
                >
                  <option value="">בחר משתמש להוספה</option>
                  {users
                    .filter((user) => !selectedUsers.includes(user._id))
                    .map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
  
      {/* מנצחים */}
      <div className="winners">
        <h3>מנצחים שלב בתים:</h3>
        <ul>
          {winners.length > 0 ? (
            winners.map((winner) => (
              <li key={winner._id}>
                {winner.firstName} {winner.lastName}
              </li>
            ))
          ) : (
            <li>לא הוגדרו מנצחים בשלב בתים</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default GroupStage;
