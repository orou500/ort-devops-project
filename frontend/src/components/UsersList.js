import "../style/UsersList.css";

export const UsersList = ({ users, setUsers, setAdminUsers, adminUsers }) => {

    const removeUser = (userId) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
        if (setAdminUsers) {
            setAdminUsers((prevAdminUsers) => prevAdminUsers.filter((adminID) => adminID !== userId));
        }
    };

    const toggleAdminStatus = (userID) => {
        if (setAdminUsers && adminUsers) {
            setAdminUsers((prevAdminUsers) => {
                if (prevAdminUsers.includes(userID)) {
                    return prevAdminUsers.filter((adminID) => adminID !== userID);
                } else {
                    return [...prevAdminUsers, userID];
                }
            });
        }
    };

    return (
        <>
            <div className="users-list">
                {users && users.length > 0 ? (
                    users.map((user) => {
                        const isAdmin = adminUsers?.includes(user._id); // בדיקה אם המשתמש הוא מנהל

                        return (
                            <div className="user-box" key={user._id}>
                                {/* הצגת checkbox רק אם adminUsers קיים והוא לא ריק */}
                                {adminUsers && user.email && (
                                    <div className="checkbox-wrapper-13">
                                        <input
                                            className="admin-status"
                                            id={user.name}
                                            type="checkbox"
                                            checked={isAdmin} // מסומן אם המשתמש הוא מנהל
                                            onChange={() => toggleAdminStatus(user._id)} // שינוי סטטוס מנהל
                                        />
                                        <label htmlFor={user.name}>מנהל</label>
                                    </div>
                                )}
                                <p>{user.email}</p>
                                <p>{user.firstName} {user.lastName}</p>
                                <button className="btn btn-cancel" onClick={() => removeUser(user._id)}>
                                    הסר משתמש
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div>
                        <p>לא נבחרו משתמשים</p>
                    </div>
                )}
            </div>
        </>
    );
};
