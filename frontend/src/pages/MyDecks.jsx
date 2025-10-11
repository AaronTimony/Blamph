import DeckPicker from "../components/deckPicker"
import SearchBar from "../components/searchBar"
import {useState, useEffect} from "react"
import {useMyDecks} from "../hooks/useDeck"
import "../css/myDecksPage.css"
import {SearchLoading} from "../components/Loading.jsx"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import {
  sortableKeyboardCoordinates,
  arrayMove
} from '@dnd-kit/sortable';

function MyDecks() {
  const {
    getMyDecks,
    deleteDeck,
    setSearchQuery,
    searchQuery,
    searchDecksQuery,
    reorderDecksMutation
  } = useMyDecks();

  const [activeId, setActiveId] = useState(null);
  const [localDecks, setLocalDecks] = useState([])

  const decks = searchQuery ? searchDecksQuery.data : getMyDecks.data

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    setLocalDecks(decks)
  }, [decks])


  function handleDragEnd(event) {
    const {active, over} = event;

    if (active.id !== over.id) {
      const oldIndex = localDecks.findIndex(deck => deck.deck_name === active.id)
      const newIndex = localDecks.findIndex(deck => deck.deck_name === over.id)

      const reordered_decks = arrayMove(localDecks, oldIndex, newIndex);

      const updatedDecks = reordered_decks.map((deck, index) => ({
        ...deck,
        deck_order: index + 1
      }));

      setLocalDecks(updatedDecks)

      reorderDecksMutation.mutate(
        updatedDecks.map(deck => ({
          deck_name: deck.deck_name,
          deck_order: deck.deck_order
        }))
      );
    }
  }

  function handleDragStart(event) {
    const {active} = event;

    setActiveId(active.id);
  }

  const isLoading = getMyDecks.isLoading || getMyDecks.isPending || searchDecksQuery.isLoading || reorderDecksMutation.isLoading || reorderDecksMutation.isPending

  if (isLoading) return <div><SearchLoading detail={"Decks..."} /></div>


  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <SearchBar onSearch={setSearchQuery} detail={"decks"}/>
      {localDecks && localDecks.length > 0 ? (
        <DeckPicker decks={decks} added={true} delDeckfromUser={deleteDeck}/>
      ) : (
          <div className="no-decks-found-box">
            <h1 className="no-decks-found-text"> No Decks Found! </h1>
            <p className="no-decks-found-subtext"> You can add decks from the 'Decks' page using the + button. </p>
          </div>
        )}
    </DndContext>
  )
}

export default MyDecks;
