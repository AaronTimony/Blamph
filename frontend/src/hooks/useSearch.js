import {useAuthContext} from "../contexts/AuthContext"
import {useQuery, useMutation} from "@tanstack/react-query"
import API_BASE_URL from "../config"
import {useParams} from "react-router-dom"

export function useSearch(searchquery) {
  const searchAllWords = useQuery({
    queryKey: ["SearchWords", searchquery],
    queryFn: async (searchquery) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/search/words?query=${searchquery}`, {
        headers: {"Content-Type" : "application/json"},
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Failed to retrieve word/meaning")
      }

      const words = await response.json()

      return words
    }
  })

  return {searchAllWords}
}
