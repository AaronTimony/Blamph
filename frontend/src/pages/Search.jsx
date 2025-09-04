import {useState, useEffect} from "react";
import {useAuthContext} from "../contexts/AuthContext"
import "../css/search.css"

function SearchWord() {
  const [query, setQuery] = useState("")
  const {apiCall} = useAuthContext();
  const [words, setWords] = useState([])
  const [userWords, setUserWords] = useState([])

  const fetchData = async (e) => {
    e.preventDefault()
    try{
      const response = await fetch(`blamph.onrender.com/api/v1/search/words?query=${query}`, {
        headers: {"Content-Type" : "application/json"},
        method: "GET",
      })
      if (!response.ok) {
        throw new Error("Failed to retrieve word/meaning")
      }
      const words = await response.json()
      setWords(words)
    } catch(error) {
      console.error("Unable to retrieve results from search", error)
    }
  };

  const fetchUserWords = async (e) => {
    e.preventDefault()
    try{
      const response = await apiCall("blamph.onrender.com/api/v1/words/getWords")
      if (!response.ok) {
        throw new Error("Could not fetch words")
      }
      const userWords = await response.json()

      setUserWords(userWords)
    } catch(error) {
      console.error("Failed to find user's words", error)
    }
  }
  return (
    <div className="search-content">
      <form onSubmit={fetchData} label="Search-asfsaf">
        <label htmlFor="Search" className="search-input">Input Search</label>
        <input
          id="Search"
          placeholder="Search for words here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" label="search-btn-lol">Click to search</button>
      </form>
      <div>
        {words.map((word, index) => (
            <p key={index}>{word.rank} - {word.meaning} - {word.jp_word} - {word.overall_frequency}</p>
        ))}
        </div>
      <form onSubmit={fetchUserWords}>
        <button type="submit">Get user's words from decks</button>
      </form>
      <div>
        {userWords.map((word, index) => (
        <p key={index}>{word.rank}: {word.meaning} - {word.jp_word} - {word.overall_frequency}</p>
        ))}
      </div>
    </div>
  )
}

export default SearchWord;
