import {createDecks, callAPI} from "../services/populate_decks_from_api.js"

export default function AdminPage() {

  const handleClick = async (e) => {
    e.preventDefault()
    await createDecks()
  }

  const handleOtherClick = async (e) => {
    e.preventDefault()
    const response = await callAPI()
    console.log(response)
  }

  return (
    <>
      <div className="admin-panel">
        <label> Add decks in specified URL </label>
        <button className="add-deck-button" onClick={handleClick} />
      </div>
      <div className="test-api">
        <label>test my api to see!</label>
        <button className="add-deck-button" onClick={handleOtherClick} />
      </div>
    </>
  )
}
