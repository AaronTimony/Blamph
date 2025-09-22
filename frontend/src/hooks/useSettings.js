import {useQueryClient, useQuery, useMutation} from "@tanstack/react-query"
import API_BASE_URL from "../config"
import {useAuthContext} from "../contexts/AuthContext"

export function useSettings(setDailyNewWords) {
  const {apiCall} = useAuthContext();
  const queryClient = useQueryClient();
  
  const updateNewDailyWords = useMutation({
    mutationFn: async (dailyNewWords) => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/settings/updateNewWords`, {
        method: "PATCH",
        body: JSON.stringify({newDailyWords: dailyNewWords})
      })
      if (!response.ok) {
        throw new Error("Could not update users new daily words")
      }
      const data = await response.json()
      setDailyNewWords("")

      return data
    },
    onSuccess: () => {queryClient.invalidateQueries(["WordCounts"])},
    onError: (error) => console.log("Failed to update new daily cards", error)
  })

  const updateNewWordOrdering = useMutation({
    mutationFn: async (newWordOrdering) => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/settings/updateNewWordsAppearanceOrder`, {
        method: "PATCH",
        body: JSON.stringify({newWordOrdering})
      })

      if (!response.ok) {
        throw new Error("Could not update users new words ordering")
      }
      const data = await response.json()

      return data
    },
    onSuccess: () => {queryClient.invalidateQueries(["NewWord"])},
    onError: (error) => console.log("Failed to update new words ordering", error)
  })
  return {updateNewDailyWords, updateNewWordOrdering}
}
