import DeckPicker from "../components/deckPicker"
import SearchBar from "../components/searchBar"
import {useCallback, useState, useEffect} from "react"
import {useAuthContext} from "../contexts/AuthContext"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';

import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';

function MyDecks() {
  const {apiCall} = useAuthContext();
  const [activeId, setActiveId] = useState(null);
  const [userDecks, setUserDecks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [allDecks, setAllDecks] = useState([])
  /*We add a refresh trigger so that we update the order of the decks when a deck is deleted or moved we find the new orders and update them in the window.*/
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    const getUserDecks = async () => {
      try{
        const [myDecksResponse, myDecksPercentageResponse] = await Promise.all([
          await apiCall("blamph.onrender.com/api/v1/decks/myDecks").catch(() => null),
          await apiCall("blamph.onrender.com/api/v1/decks/known_percent").catch(() => null)
        ])

        let myDecks = [];

        if (myDecksResponse?.ok) {
          myDecks = await myDecksResponse.json()
        }

        let deck_percentages = [];

        if (myDecksPercentageResponse?.ok) {
          deck_percentages = await myDecksPercentageResponse.json()
        }


        const newPercentMap = new Map(
          deck_percentages.map(item => [item.deck_name, item.known_per])
        )

        const available_decks = myDecks.map(deck => ({
          ...deck,
          known_percentage: (newPercentMap.get(deck.deck_name) || 0).toFixed(1)
        }))

        setUserDecks(available_decks)
        setAllDecks(available_decks)
      } catch(error) {
        console.log("Failed to retrieve decks", error)
      }
    }
    getUserDecks();
  }, [refreshTrigger])

  const DeleteDeck = useCallback(async (e, deckName, deck_order) => {
    e.preventDefault()
    console.log(deckName, deck_order)
    try{
      const response = await apiCall("blamph.onrender.com/api/v1/decks/delete", {
        method: "DELETE",
        body: JSON.stringify({deck_name: deckName, deck_order: deck_order})
      })
      if (!response.ok) {
        throw new Error("Failed to delete deck")
      }
      setUserDecks(prevDecks => prevDecks.filter(deck => deck.deck_name !== deckName));
    } catch(error) {
      console.error("Error in removing deck", error)
    }
    setRefreshTrigger(prev => prev + 1)
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setUserDecks(allDecks)
      return;
    }

   const searchAnime = setTimeout(async () => {
      try{
        const response = await apiCall(`blamph.onrender.com/api/v1/decks/search/myDecks?q=${encodeURIComponent(searchQuery)}`)
        if (!response.ok) {
          throw new Error("Could not retrieve decks")
        }
        const results = await response.json()
        setUserDecks(results)
      } catch(error) {
        console.error("Found error in searching decks", error)
      }
    }, 300)

    return () => clearTimeout(searchAnime);
  }, [searchQuery])

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
          await apiCall('blamph.onrender.com/api/v1/decks/reorder', {
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
      <DeckPicker decks={userDecks} added={true} delDeckfromUser={DeleteDeck}/>
    </DndContext>
  )
}

export default MyDecks;
