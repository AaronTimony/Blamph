import "../css/deckPicker.css"
import downloadImage from "../images/download.jpeg"
import {useState, useEffect} from "react"

function DeckPicker({}) {
  const [deck, setDeck] = useState(null);

  useEffect(() => {
    const getDeck = async () => {
      const response = await fetch("http://localhost:8000/deck");
      const data = await response.json();
      console.log(data);
      setDeck(data);
    }
    getDeck();
  }, [])
  function addDeckClick(e) {
    e.preventDefault()
    alert("clicked")
  }

  if (!deck) return <div>Loading...</div>;
  return (
  <div className="deck-card">
      <div className="deck-poster">
        <button onClick={addDeckClick} className="add-deck-btn">+</button>
      </div>
      <div className="deck-info">
        <h1>{deck.name}</h1>
        <p className="deck-elem">Difficult: {deck.difficulty}</p>
        <p className="deck-elem">Number of Words: {deck.wordCount}</p>
      </div>
    </div>
  )
}





export default DeckPicker
