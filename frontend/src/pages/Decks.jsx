import DeckPicker from "../components/deckPicker"
import SearchBar from "../components/searchBar"
import {useState, useEffect} from "react";
/*import {createDecks, fetchTopAnime} from "../services/populate_decks_from_api" 
/*only used when i want to update my decks from the api*/
import {useAuthContext} from "../contexts/AuthContext"
function Decks() {
  const {apiCall} = useAuthContext();
  const [allDecks, setAllDecks] = useState([])
  const [decks, setDecks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const getDecksWithKnownPercent = async () => {
      try{
        const [ownedDecksResponse, allDecksResponse, knownPercentResponse] = await Promise.all([
          apiCall("http://127.0.0.1:8000/api/v1/decks/myDecks").catch(() => null),
          fetch("http://127.0.0.1:8000/api/v1/decks"),
          apiCall("http://127.0.0.1:8000/api/v1/decks/known_percent").catch(() => null)
        ]);

        let ownedDecks = []

        if (ownedDecksResponse?.ok) {
          ownedDecks = await ownedDecksResponse.json();
        }

        const allDecks = await allDecksResponse.json();

        let knownPercentages = [];
        /*We need this stuff in case knownPercentages doesn't return in that case things will break. */

        if (knownPercentResponse?.ok) {
          knownPercentages = await knownPercentResponse.json();
        }

        const knownPercentMap = new Map(
          knownPercentages.map(item => [item.deck_name, item.known_per])
        );

        const ownedDecksSet = new Set(ownedDecks.map(deck => deck.deck_name));

        const availableDecks = allDecks
        .filter(deck => !ownedDecksSet.has(deck.deck_name))
        .map(deck => ({
          ...deck,
          known_percentage: (knownPercentMap.get(deck.deck_name) || 0).toFixed(1)
        }));

        setDecks(availableDecks)
        setAllDecks(availableDecks)
      } catch (error) {
        console.error("Failed to fetch deck data", error);
      }
    }
    getDecksWithKnownPercent();
  }, []);

  const addDecktoUser = async (e, deckName, image_url) => {
    e.preventDefault()
    try{
      const response = await apiCall("http://127.0.0.1:8000/api/v1/decks/AddDeck", {
        method: "POST",
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

  /*This is to ensure when we remove something from the search query, it goes back to the default of showing all decks.*/
  useEffect(() => {
    if (!searchQuery) {
      setDecks(allDecks)
      return;
    }

  const searchDecks = setTimeout(async () => {
    try{
      const response = await fetch(`http://127.0.0.1:8000/api/v1/decks/search?q=${encodeURIComponent(searchQuery)}`)
      if (!response.ok) {
        throw new Error("Failed to find decks")
      }
      const searchDecks = await response.json()
      setDecks(searchDecks)
    } catch(error) {
      console.error("failed to search decks", error)
    }
  }, 150);
  return () => clearTimeout(searchDecks)
  }, [searchQuery]);

  return (
    <>
      <SearchBar onSearch={setSearchQuery}/>
      <DeckPicker decks={decks} added={false} addDecktoUser={addDecktoUser}/>
    </>
  )

}

export default Decks;
