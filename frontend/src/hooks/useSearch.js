import {useAuthContext} from "../contexts/AuthContext"
import {useQuery, useMutation} from "@tanstack/react-query"
import API_BASE_URL from "../config"
import {useParams} from "react-router-dom"

export function useSearch(searchquery) {
  const {apiCall} = useAuthContext();
  const searchAllWords = useQuery({
    queryKey: ["SearchWords", searchquery],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/search/words?query=${searchquery}`, {
        headers: {"Content-Type" : "application/json"},
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to retrieve word/meaning")
      }

      const words = await response.json()

      return words
    },
    enabled: !!searchquery,
  })

  const addWordToPriorityQueue = useMutation({
    mutationFn: async (card_id) => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/search/addWordPriority`, {
        method: "PATCH",
        body: JSON.stringify({card_id})
      })

      if (!response.ok) {
        throw new Error("Failed to retrieve card_id or add word to queue")
      }

      const priority_response = await response.json()

      return priority_response
    }
  })


  return {searchAllWords, addWordToPriorityQueue}
}

export function useSearchinDeck(searchquery, deck_name) {

  const searchWordsinDeck = useQuery({
    queryKey: ["SearchDeckWords", searchquery, deck_name],
    queryFn: async () => {
    console.log(searchquery, deck_name)
      const response = await fetch(`${API_BASE_URL}/api/v1/search/deckWords?query=${searchquery}&deck_name=${deck_name}`, {
        headers: {"Content-Type" : "application/json"},
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to retrieve word/meaning")
      }

      const words = await response.json()

      return words
    },

    enabled: !!searchquery && !!deck_name,
  })

  return {searchWordsinDeck}
}
