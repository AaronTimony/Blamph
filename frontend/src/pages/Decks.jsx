import DeckPicker from "../components/deckPicker"
import {SearchLoading} from "../components/Loading"
import SearchBar from "../components/searchBar";
import { useDecks } from "../hooks/useDeck"
import {useState} from "react"
import FormError from "../components/formError"

/*import {createDecks, fetchTopAnime} from "../services/populate_decks_from_api" 
/*only used when i want to update my decks from the api*/
function Decks() {

  const {availableDecksQuery,
    addDecktoUser,
    searchDecksQuery,
    displayError,
    setSearchQuery,
    searchQuery
  } = useDecks();

  
  const isLoading = searchDecksQuery.isLoading || availableDecksQuery.isLoading || availableDecksQuery.isPending

  if (isLoading) return <div><SearchLoading detail={"Decks"}/></div>

  if (availableDecksQuery.isError) return <div>{availableDecksQuery.error}</div>


  let decks = availableDecksQuery.data

  if (searchQuery) {
    decks = searchDecksQuery.data
  }

  if (decks === null) {
    return <h1> No decks added yet! </h1>
  }

  return (
    <>
      <SearchBar onSearch={setSearchQuery} detail={"Decks"}/>
      <DeckPicker decks={decks} added={false} addDecktoUser={addDecktoUser} />
      {displayError && <FormError error="Login Required" className="create-deck-error"/>}
    </>

  )
}

export default Decks;
