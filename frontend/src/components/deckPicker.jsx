import "../css/deckPicker.css"
import {useNavigate} from "react-router-dom";
import {SearchLoading} from "../components/Loading"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

function SortableDeck({deck, addDecktoUser, added, delDeckfromUser}) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: deck.deck_name});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div key={deck.deck_name} className="deck-component">
        <div className="deck-title-box">
          <h2 className="deck-title">{deck.deck_name}</h2>
          <button onClick={() => navigate(`/decks/${deck.deck_name}`)} 
            onPointerDown={(e) => e.stopPropagation()}
            className={deck.deck_order ? "deck-details-button" : "deck-details-button no_order"}>
            See Deck Details
          </button>
          <h2 className="deck-order">{deck.deck_order}</h2>

        </div>
        <div className="deck-card">
          <div className="deck-section deck-image">
            <img src={deck.image_url} alt={deck.deck_name} />
          </div>

          <div className="deck-section deck-property difficulty-section">
            <div className="property-label">Unique Words</div>
            <div className="property-value">{deck.unique_words}</div>
          </div>

          <div className="deck-section deck-property word-count-section">
            <div className="property-label">Words</div>
            <div className="property-value">{deck.total_words}</div>
          </div>

          <div className="deck-section deck-property knowledge-section">
            <div className="property-label">Known</div>
            <div className="property-value">{deck.known_percentage ?? 0}</div>
          </div>
          {added ? (
            <div className="deck-section add-button-section">
              <form onSubmit={(e) => delDeckfromUser(e, deck.deck_name, deck.deck_order)} className="add-deck-form">
                <button type="submit" className="add-deck-btn">-</button>
              </form>
            </div>
          ) : (
              <div className="deck-section add-button-section">
                <form onSubmit={(e) => addDecktoUser(e, deck.deck_name, deck.image_url)} className="add-deck-form">
                  <button type="submit" className="add-deck-btn">+</button>
                </form>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

function DeckPicker({decks, addDecktoUser, added, delDeckfromUser}) {
  if (!decks) return <div>
    <SearchLoading detail={"Decks"}/>
  </div>

  return (
    <SortableContext
      items={decks.map(deck => deck.deck_name)}
      strategy={verticalListSortingStrategy}>
      <div className="deck-picker-container">
        {decks.map((deck) => (
          <SortableDeck
            key={deck.deck_name}
            deck={deck}
            added={added}
            delDeckfromUser={delDeckfromUser}
            addDecktoUser={addDecktoUser}
          />
        ))}
      </div>
    </SortableContext>
  )
}

export default DeckPicker
