import {useAuthContext} from "../contexts/AuthContext"
import {useQuery} from "@tanstack/react-query"
import API_BASE_URL from "../config"
import {useParams} from "react-router-dom"

export default function useWords() {
  const {apiCall} = useAuthContext();
  const {deck_name} = useParams();

  const wordsQuery = useQuery({
    queryKey: ['words', deck_name],
    queryFn: async () => {
      const res = await apiCall(`${API_BASE_URL}/api/v1/words/getDeckWords`, {
        method: 'POST',
        body: JSON.stringify({deck_name})
      });
      if (!res.ok) throw new Error("Could not find words")

      const words = await res.json();

      return words
    },
    enabled: !!deck_name,
    staleTime: 5 * 60 * 1000
  })

  return {wordsQuery, deck_name}
}
