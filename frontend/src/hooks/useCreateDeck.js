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

      const responseData = await response.json()

      return responseData
    },
    onError: (error) => {
      console.log('Full error:', error.message)
    }
  })
  return {createDeckMutation}
}
