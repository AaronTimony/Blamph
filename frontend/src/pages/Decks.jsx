import DeckPicker from "../components/deckPicker"
import SearchBar from "../components/searchBar"
import {useState, useEffect} from "react";
import {FetchTopAnime, SearchTopAnime} from "../services/jikan_api"
function Decks() {
  const [decks, setDecks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {

    const getAnime = async () => {
      try{
        const token = localStorage.getItem("access_token");
        let ownedDecks = [];

        if (token) {
          const response = await fetch("http://127.0.0.1:8000/api/v1/decks/myDecks",{ 
            method: "GET",
            headers: {"Content-Type" : "application/json",
              "Authorization" : `Bearer ${token}`}
          });

          if (!response.ok) {
            console.log("Could not find token, showing all decks")
          } else {
            ownedDecks = await response.json()
          }
        }
        const animeList = await FetchTopAnime();

        const transformedDecks = animeList.map((anime) => ({
          deck_name:anime.title,
          image_url: anime.image,
        }));

        /* Filters out all the decks that you own (note we created ownedDecks to be empty if we don't have a token so this naturally produces all decks even when logged out) */
        const ownedDecksSet = new Set(ownedDecks.map(deck => deck.deck_name));
        const cur_available_decks = transformedDecks.filter(
          deck => !ownedDecksSet.has(deck.deck_name)
        );
        setDecks(cur_available_decks)
      } catch(error) {
        console.log("Failed to fetch decks", error);
      }
    }
    getAnime();
  }, []);

  const addDecktoUser = async (e, deckName, image_url) => {
    e.preventDefault()
    try{
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/api/v1/decks/AddDeck", {
        method: "POST",
        headers: {"Content-Type" : "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({deck_name: deckName, image_url}),
      });
      if (!response.ok) {
        console.error("Failed to add deck:", response.status);
      }
      setDecks(prevDecks => prevDecks.filter(deck => deck.deck_name !== deckName))
    } catch(error) {
      console.log(error)
    }
  }
  const doSearch = async () => {
    try{
      if (!searchQuery.trim()) {
        return
      } else {
        const searching = true;
      }
      const results = await SearchTopAnime(searchQuery);

      const searchDecks = results.map((anime) => ({
        deck_name:anime.title,
        image_url: anime.image,
      }));
      setDecks(searchDecks)
    } catch(error) {
      console.error("Could not perform search", error);
    }
  }

  useEffect(() => {
    if (searchQuery) {
      doSearch();
    }
  }, [searchQuery]);

  return (
    <>
  <div className="search-bar">
      <form onSubmit={doSearch}>
        <input
        id="search-box"
        placeholder="Search Decks..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-btn">Search</button>
      </form>
    </div>
      <DeckPicker decks={decks} added={false} addDecktoUser={addDecktoUser}/>
    </>
  )

}

export default Decks;
