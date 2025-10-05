import {useState} from "react"
import "../css/settingsPage.css"
import {useSettings} from "../hooks/useSettings"
import {SORT_OPTIONS} from "../constants/sortOptions"

export function SettingsComponent() {
  const [dailyNewWords, setDailyNewWords] = useState("")
  const [newWordOrdering, setNewWordOrdering] = useState("")
  const {updateNewDailyWords, updateNewWordOrdering} = useSettings(setDailyNewWords);

  const handleDailyWords = (e) => {
    e.preventDefault()
    updateNewDailyWords.mutate(dailyNewWords)
  }

  const handleNewWordOrdering = (e) => {
    e.preventDefault()
    updateNewWordOrdering.mutate(newWordOrdering)
  }

  return (
    <div className="Settings-box">
      <form onSubmit={handleDailyWords}>
        <label>Change number of new words daily </label>
        <input type="text" value={dailyNewWords} onChange={(e) => {
          const value = e.target.value.replace(/[^0-9]/g, '')
          setDailyNewWords(value)
        }} inputMode="numeric" className="daily-words-box"/>
        <button type="submit" className="daily-words-button">Change New Words</button>
      </form>

      <form onSubmit={handleNewWordOrdering}>
        <label> Change order of new words: </label>
        <select value={newWordOrdering} onChange={(e) => setNewWordOrdering(e.target.value)}>
          {SORT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="submit" className="apply-new-word-button">Apply New Ordering </button>
      </form>
    </div>
  )
}
