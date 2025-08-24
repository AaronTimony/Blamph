import {useState, useEffect} from "react";

function SearchWord() {
  const [query, setQuery] = useState("")
  const [words, setWords] = useState([])

  const fetchData = async (e) => {
    e.preventDefault()
    try{
      const response = await fetch(`http://127.0.0.1:8000/api/v1/search/words?query=${query}`, {
        headers: {"Content-Type" : "application/json"},
        method: "GET",
      })
      if (!response.ok) {
        throw new Error("Failed to retrieve word/meaing")
      }
      const words = await response.json()
      setWords(words)
    } catch(error) {
      console.error("Unable to retrieve results from search", error)
    }
  };

  return (
    <>
      <form onSubmit={fetchData} label="Search-asfsaf">
        <label htmlFor="Search">Input Search</label>
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
          <>
            <p key={index}>{word.meaning} -> {word.jp_word}</p>
          </>
        ))}
        </div>
    </>
  )
}

export default SearchWord;
