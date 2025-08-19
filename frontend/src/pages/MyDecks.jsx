import DeckPicker from "../components/deckPicker"
import SearchBar from "../components/searchBar"
/*import createDecks from "../services/populate_decks_from_api" 
 * only used when i want to update my decks from the api*/
import {useCallback, useState, useEffect} from "react"

function MyDecks() {
  const [userDecks, setUserDecks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [allDecks, setAllDecks] = useState([])
  useEffect(() => {
    const getUserDecks = async () => {
      try{
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://127.0.0.1:8000/api/v1/decks/myDecks", {
          method: "GET",
          headers: {"Content-Type" : "application/json",
            "Authorization" : `Bearer ${token}`}
        })
        if (!response.ok) {
          throw new Error("Failed to get users decks")
        }
        const data = await response.json()
        setUserDecks(data)
        setAllDecks(data)
        console.log(userDecks)
      } catch(error) {
        console.log("Failed to retrieve decks", error)
      }
    }
    getUserDecks();
    console.log("Decks",userDecks)
  },[])

  const DeleteDeck = useCallback(async (e, deckName) => {
    e.preventDefault()
    const token = localStorage.getItem("access_token")
    try{
      const response = await fetch("http://127.0.0.1:8000/api/v1/decks/delete", {
        method: "DELETE",
        headers: {"Content-Type" : "application/json",
        "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({deck_name: deckName})
      })
      if (!response.ok) {
        throw new Error("Failed to delete deck")
      }
      setUserDecks(prevDecks => prevDecks.filter(deck => deck.deck_name !== deckName));
    } catch(error) {
      console.error("Error in removing deck", error)
    }
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setUserDecks(allDecks)
      return;
    }

   const searchAnime = setTimeout(async () => {
      try{
        const token = localStorage.getItem("access_token");
        const response = await fetch(`http://127.0.0.1:8000/api/v1/decks/search/myDecks?q=${encodeURIComponent(searchQuery)}`, {
          headers: {"Content-Type" : "application/json",
          "Authorization" : `Bearer ${token}`}
        })
        if (!response.ok) {
          throw new Error("Could not retrieve decks")
        }
        const results = await response.json()
        setUserDecks(results)
      } catch(error) {
        console.error("Found error in searching decks", error)
      }
    }, 150)

    return () => clearTimeout(searchAnime);
  }, [searchQuery])
  return (
    <>
      <SearchBar onSearch={setSearchQuery} />
      <DeckPicker decks={userDecks} added={true} delDeckfromUser={DeleteDeck}/>
    </>
  )
}

export default MyDecks;
