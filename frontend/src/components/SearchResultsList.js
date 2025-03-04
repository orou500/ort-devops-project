import "../style/SearchResultsList.css";
import { SearchResult } from "./SearchResult";

export const SearchResultsList = ({ results, setUsers, users }) => {
  return (
    <div className="results-list">
      {results.map((result, id) => {
        return <SearchResult result={result} setUsers={setUsers} users={users} key={id}/>;
      })}
    </div>
  );
};