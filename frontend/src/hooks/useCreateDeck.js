import {useMutation, useQueryClient} from "@tanstack/react-query"
import API_BASE_URL from "../config"
import {useAuthContext} from "../contexts/AuthContext"

export function useCreateDeck() {
  const queryClient = useQueryClient()
  const {user} = useAuthContext();

  const createDeckMutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/api/v1/words/addSubs/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        method: "POST",
        body: formData
      })
      if (!response.ok) {

        const errorData = await response.json();
        console.log('Response status:', response.status);
        console.log('Response statusText:', response.statusText);
        console.log('Error data:', errorData);

        throw new Error(
          errorData.message || 
            errorData.detail || 
            `Failed to create new deck: ${response.status} ${response.statusText}`
        );
      }

      const responseData = await response.json()

      return responseData
    },
    onSuccess: () => {queryClient.refetchQueries(["myDecks", user?.id])},
    onError: (error) => {
      
    }
  })
  return {createDeckMutation}
}
