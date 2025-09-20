import {useState} from "react"
import {useAuthContext} from "../contexts/AuthContext"
import API_BASE_URL from "../config"
import {useQueryClient, useMutation} from "@tanstack/react-query"
import "../css/settingsPage.css"

export function SettingsComponent() {
  const [dailyNewWords, setDailyNewWords] = useState("")
  const {apiCall} = useAuthContext();
  const queryClient = useQueryClient();

  const updateNewDailyWords = useMutation({
    mutationFn: async (dailyNewWords) => {
      console.log(dailyNewWords)
      const response = await apiCall(`${API_BASE_URL}/api/v1/settings/updateNewWords`, {
        method: "PATCH",
        body: JSON.stringify({newDailyWords: dailyNewWords})
      })
      if (!response.ok) {
        throw new Error("Could not update users new daily words")
      }
      const data = await response.json()
      setDailyNewWords("")

      return console.log(data)
    },
    onSuccess: () => {queryClient.invalidateQueries(["WordCounts"])},
    onError: (error) => console.log("Failed to update new daily cards", error)
  })

  const handleDailyWords = (e) => {
    e.preventDefault()
    updateNewDailyWords.mutate(dailyNewWords)
  }

  return (
    <div className="Settings-box">
      <form onSubmit={handleDailyWords}>
        <input type="text" value={dailyNewWords} onChange={(e) => {
          const value = e.target.value.replace(/[^0-9]/g, '')
          setDailyNewWords(value)
        }} inputMode="numeric" className="daily-words-box"/>
        <button type="submit" className="daily-words-button">Daily New Words: </button>
      </form>
    </div>
  )
}
