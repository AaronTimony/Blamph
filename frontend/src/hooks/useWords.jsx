import {useAuthContext} from "../contexts/AuthContext"
import {useQuery} from "@tanstack/react-query"
import API_BASE_URL from "../config"
import {useParams} from "react-router-dom"

export default function useWords(deckSortMethod) {
  const {apiCall} = useAuthContext();
  const {deck_name, page} = useParams()

  const wordsQuery = useQuery({
    queryKey: ['words', page, deck_name, deckSortMethod],
    queryFn: async () => {
      const res = await apiCall(`${API_BASE_URL}/api/v1/words/getDeckWords`, {
        method: 'POST',
        body: JSON.stringify({deck_name, page, ordering:deckSortMethod})
      });
      if (!res.ok) throw new Error("Could not find words")

      const words = await res.json();

      console.log(words)
      return words
    },
    enabled: !!deck_name,
    staleTime: 5 * 60 * 1000
  })

  return {wordsQuery, deck_name, page}
}
