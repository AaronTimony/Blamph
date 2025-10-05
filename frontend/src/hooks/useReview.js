import API_BASE_URL from "../config"
import {useAuthContext} from "../contexts/AuthContext"
import {useQuery, useQueryClient, useMutation} from "@tanstack/react-query"
import {useEffect, useState} from "react"

export function useReviewPage() {
  const {apiCall} = useAuthContext();

  const getWordCounts = useQuery({
    queryKey: ["WordCounts"],
    queryFn: async () => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/review/AllCardCounts/`)
      if (!response.ok) {
        throw new Error("Failed to find new word count")
      }
      const counts = await response.json()

      return counts
    },
  })

  return {getWordCounts}
}

export function useReview() {
  const {apiCall} = useAuthContext();
  const queryClient = useQueryClient();
  const [newWordsCount, setNewWordsCount] = useState(0);

  const getNewCard = useQuery({
    queryKey: ["NewWord"],
    queryFn: async (newWordOrder) => {

      const response = await apiCall(`${API_BASE_URL}/api/v1/review/newcards/`)

      if (!response.ok) {
        throw new Error("Failed to find new card")
      }

      const new_card = await response.json()

      return new_card
    },
  })

  const getReviewCard = useQuery({
    queryKey: ["ReviewWord"],
    queryFn: async () => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/review/reviewcards/`)

      if (!response.ok) {
        throw new Error("Failed to find due card")
      }

      const due_card = await response.json()

      return due_card
    },
    staleTime: 10000,
  })

  const postNewCardRating = useMutation({
    mutationFn: async ({japWord, rating}) => {
          const response = await apiCall(`${API_BASE_URL}/api/v1/review/newcardrating/`, {
            method: "POST",
            body: JSON.stringify({"jp_word" : japWord, "rating" : rating})
          })

          if (!response.ok) {
            throw new Error("Could not patch with new rating")
          }
    },
    onSuccess: () => {queryClient.invalidateQueries(['NewWord'])}

  })

  const postReviewCardRating = useMutation({
    mutationFn: async ({japWord, rating}) => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/review/reviewcardrating/`, {
        method: "PATCH",
        body: JSON.stringify({"jp_word" : japWord, "rating": rating})
      })

      if (!response.ok) {
        throw new Error("Could not patch with new rating")
      }
    },
    onSuccess: () => {queryClient.invalidateQueries(['ReviewWord'])}
  })

  return {postNewCardRating, getNewCard, getReviewCard, postReviewCardRating}
}
