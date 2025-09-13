import DeckPicker from "../components/deckPicker"
import SearchBar from "../components/searchBar";
import { useDecks} from "../hooks/useNewDeck"

/*import {createDecks, fetchTopAnime} from "../services/populate_decks_from_api" 
/*only used when i want to update my decks from the api*/
function Decks() {

  const {availableDecksQuery,
    addDecktoUser,
    searchDecksQuery,
    setSearchQuery,
    searchQuery
  } = useDecks();

  if (availableDecksQuery.isLoading) return <div>Loading Decks...</div>

  if (availableDecksQuery.isError) return <div>{availableDecksQuery.error}</div>

  let decks = availableDecksQuery.data

  if (searchQuery) {
    decks = searchDecksQuery.data
  }

  return (
    <>
      <SearchBar onSearch={setSearchQuery} />
      <DeckPicker decks={decks} added={false} addDecktoUser={addDecktoUser} />
    </>
  )
}

export default Decks;
