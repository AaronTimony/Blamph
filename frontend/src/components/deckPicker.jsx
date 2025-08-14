import "../css/deckPicker.css"
import downloadImage from "../images/download.jpeg"
import {useState, useEffect} from "react"

function DeckPicker({decks, addDecktoUser, added, delDeckfromUser}) {
  if (!decks) return <div>Loading...</div>;
  return (
    <div className="deck-picker-container">
      {decks.map((deck) => (

        <div key={deck.deck_name} className="deck-component">
          <div className="deck-title-box">
            <h2 className="deck-title">{deck.deck_name}</h2>
          </div>
          <div className="deck-card">
            <div className="deck-section deck-image">
              <img src={deck.image_url} alt={deck.deck_name} />
            </div>

            <div className="deck-section deck-property difficulty-section">
              <div className="property-label">Difficulty</div>
              <div className="property-value">0</div>
            </div>

            <div className="deck-section deck-property word-count-section">
              <div className="property-label">Words</div>
              <div className="property-value">0</div>
            </div>

            <div className="deck-section deck-property knowledge-section">
              <div className="property-label">Known</div>
              <div className="property-value">0</div>
            </div>
            {added ? (
            <div className="deck-section add-button-section">
              <form onSubmit={(e) => delDeckfromUser(e, deck.deck_name)} className="add-deck-form">
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
      ))}
    </div>
  )
}

export default DeckPicker
