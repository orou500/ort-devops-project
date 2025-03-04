import React from 'react';
import '../style/GroupStage.css';

const ViewGroupStage = ({ groups }) => {
  if (!groups.length) return <p>אין קבוצות להצגה</p>;

  return (
    <div className="groups-container-wrapper">
      {/* קבוצות */}
        
      <h2 style={{alignSelf: "center"}}>שלב בתים:</h2>
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
                    {team.name} - נקודות: {team.points}
                  </li>
                ))
              ) : (
                <li className="no-teams">לא נוספו קבוצות</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewGroupStage;
