import "../style/SearchResult.css";

export const SearchResult = ({ result, setUsers, users }) => {
  return (
    <div
      className="search-result"
      onClick={() => {
        // בדיקה אם המשתמש כבר קיים ברשימת המשתמשים
        const userExists = users.some((user) => {
          if (user.email && result.email) {
            return user.email === result.email;
          } else {
            // בדיקה לפי שם פרטי ושם משפחה במקרה של משתמשים בלי אימייל
            return (
              user.firstName === result.firstName &&
              user.lastName === result.lastName
            );
          }
        });

        // אם המשתמש לא קיים, נוסיף אותו לרשימת המשתמשים
        if (!userExists) {
          setUsers((prevUsers) => [...prevUsers, result]);
        }
      }}
    >
      {/* מציג את שם המשתמש, כולל אימייל אם קיים */}
      {result.email ? `${result.email} | ${result.firstName} ${result.lastName}` : `${result.firstName} ${result.lastName}`}
    </div>
  );
};
