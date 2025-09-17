import API_BASE_URL from "../config"
import {useAuthContext} from "../contexts/AuthContext"
import {useQuery} from "@tanstack/react-query"

export function useReview() {
  const {apiCall} = useAuthContext();
  const getWordCounts = useQuery({
    queryKey: ["WordCounts"],
    queryFn: async () => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/review/AllCardCounts`)
      if (!response.ok) {
        throw new Error("Failed to find new word count")
      }
      const counts = await response.json()

      return counts
    }
  })

  const getNewCard = useQuery({
    queryKey: ["NewWord"],
    queryFn: async () => {

      const response = await apiCall(`${API_BASE_URL}/api/v1/review/newcards`)

      if (!response.ok) {
        throw new Error("Failed to find new card")
      }

      const new_card = await response.json()

      return new_card
    },
    staleTime: 0,
    gcTime: 0
  })

  const getReviewCard = useQuery({
    queryKey: ["ReviewWord"],
    queryFn: async () => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/review/reviewcards`)

      if (!response.ok) {
        throw new Error("Failed to find due card")
      }

      const due_card = await response.json()

      return due_card
    },
    staleTime: 0,
    gcTime: 0
  })

  return {getWordCounts, getNewCard, getReviewCard}
}
