import {useState, useRef, useEffect} from "react"
import "../css/SearchBar.css"

function SearchBar({onSearch, detail}) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      inputRef.current.focus();
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    onSearch(searchQuery)
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="submit-search-form">
        <input
          ref={inputRef}
          id="search-box"
          placeholder={`Search ${detail}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="submit-search-button">Search</button>
      </form>
    </div>
  )
}

export default SearchBar;
