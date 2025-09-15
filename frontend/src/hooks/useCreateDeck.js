import {useMutation, useQueryClient} from "@tanstack/react-query"
import API_BASE_URL from "../config"

export function useCreateDeck() {
  const createDeckMutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/api/v1/words/addSubs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        method: "POST",
        body: formData
      })

      return await response.json()
    }
  })

  return {createDeckMutation}
}
