import {useState, useRef, useEffect} from "react"
import "../css/SearchBar.css"

function SearchBar({onSearch}) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, [])

  const handleChange = async (e) => {
    const value = e.target.value
    setSearchQuery(value)
    onSearch(value)

  };

  return (
  <div className="search-bar">
        <input
        ref={inputRef}
        id="search-box"
        placeholder="Search Decks..."
        value={searchQuery}
        onChange={handleChange}
        autoComplete="off"
        />
    </div>
  )
}

export default SearchBar;
