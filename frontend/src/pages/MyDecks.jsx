import DeckPicker from "../components/deckPicker"
import SearchBar from "../components/searchBar"
import API_BASE_URL from "../config";
import {useCallback, useState, useEffect} from "react"
import {useAuthContext} from "../contexts/AuthContext"
import {SearchLoading} from "../components/Loading"
import {useMyDecks} from "../hooks/useDeck"
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

  if (reorderDecksMutation.isPending) return;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <SearchBar onSearch={setSearchQuery} />
      <DeckPicker decks={decks} added={true} delDeckfromUser={deleteDeck}/>
    </DndContext>
  )
}

export default MyDecks;
