import {useState, useRef, useEffect, FormEvent, ChangeEvent} from "react"
import "../css/SearchBar.css"
interface SearchBarProps {
  onSearch: (query: string) => void;
  detail: string;
}

function SearchBar({onSearch, detail}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      inputRef.current?.focus();
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="submit-search-button">Search</button>
      </form>
    </div>
  )
}

export default SearchBar;
