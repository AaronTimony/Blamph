import {useState} from "react"
import {SearchTopAnime} from "../services/jikan_api"
import "../css/SearchBar.css"

function SearchBar({sendResults}) {
  const [searchQuery, setSearchQuery] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return;

  const results = await SearchTopAnime(searchQuery);
  sendResults(results)
  };
  return (
  <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <input
        id="search-box"
        placeholder="Search Decks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-btn">Search</button>
      </form>
    </div>
  )
}

export default SearchBar;
