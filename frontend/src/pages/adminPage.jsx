import {createDecks} from "../services/populate_decks_from_api.js"

export default function AdminPage() {

  const handleClick = (e) => {
    e.preventDefault()
    createDecks()
  }

  return (
  <div className="admin-panel">
      <label> Add decks in specified URL </label>
      <button className="add-deck-button" onClick={handleClick} />
  </div>
  )
}
