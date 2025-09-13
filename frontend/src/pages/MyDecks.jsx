import DeckPicker from "../components/deckPicker"
import SearchBar from "../components/searchBar"
import {useCallback, useState, useEffect} from "react"
import {useAuthContext} from "../contexts/AuthContext"
import {useMyDecks} from "../hooks/useNewDeck"
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
  const {getMyDecks, deleteDeck, setSearchQuery, searchQuery, searchDecksQuery} = useMyDecks();
  const {apiCall} = useAuthContext();
  const [activeId, setActiveId] = useState(null);
  const [userDecks, setUserDecks] = useState([])
  /*We add a refresh trigger so that we update the order of the decks when a deck is deleted or moved we find the new orders and update them in the window.*/
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  let decks = getMyDecks.data
  console.log(decks)

  if (searchQuery) {
    decks = searchDecksQuery.data
  }


  function handleDragEnd(event) {
    const {active, over} = event;

    if (active.id !== over.id) {
      const oldIndex = userDecks.findIndex(deck => deck.deck_name === active.id)
      const newIndex = userDecks.findIndex(deck => deck.deck_name === over.id)

      const reordered_decks = arrayMove(userDecks, oldIndex, newIndex);

      const updatedDecks = reordered_decks.map((deck, index) => ({
        ...deck,
        deck_order: index + 1
      }));

      setUserDecks(updatedDecks)

      const update_order_backend = async () => {
        try{
          await apiCall('${API_BASE_URL}/api/v1/decks/reorder', {
            method: "PUT",
            body: JSON.stringify({
              deckOrders: updatedDecks.map(deck => ({
                deck_name: deck.deck_name,
                deck_order: deck.deck_order
              })),
            })
          });
        } catch (error) {
          console.error("Could not re-order decks", error)
        }
      }
      update_order_backend();
    }
  }

  function handleDragStart(event) {
    const {active} = event;

    setActiveId(active.id);
  }


  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <SearchBar onSearch={setSearchQuery} />
      <DeckPicker decks={decks} added={true} delDeckfromUser={deleteDeck}/>
    </DndContext>
  )
}

export default MyDecks;
