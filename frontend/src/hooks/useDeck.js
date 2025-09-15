import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query'
import {useDebounce} from "../hooks/useDebounce"
import {useState} from 'react'
import {useAuthContext} from "../contexts/AuthContext"
import API_BASE_URL from "../config"

const deckQueries = {
  allDecks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/decks`)
    if (!response.ok) throw new Error("Failed to fetch all decks")
    return await response.json()
  },

  myDecks: async (apiCall) => {
    const response = await apiCall(`${API_BASE_URL}/api/v1/decks/myDecks`)
    if (!response.ok) throw new Error("Failed to retrieve user decks")
    return await response.json()
  },

  knownPercentages: async (apiCall) => {
    const response = await apiCall(`${API_BASE_URL}/api/v1/decks/known_percent`)
    if (!response.ok) throw new Error("Failed to find deck percentages")
    return response.json()
  },

  searchDecks: async (query) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/decks/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Failed to search decks')
    const data =  await response.json()
    return data
  },

  searchMyDecks: async (apiCall, query) => {
    const response = await apiCall(`${API_BASE_URL}/api/v1/decks/search/myDecks?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Failed to search my decks')
    return await response.json()
  }
}

const deckMutations = {
  addDeck: async (apiCall, {deck_name, image_url}) => {
    const response = await apiCall(`${API_BASE_URL}/api/v1/decks/AddDeck`, {
      method: "POST",
      body: JSON.stringify({deck_name: deck_name, image_url})
    })
    if (!response.ok) throw new Error("Failed to add decks")

    return await response.json()
  },

  deleteDeck: async (apiCall, {deck_name, deck_order}) => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/decks/delete`, {
      method: "DELETE",
      body: JSON.stringify({deck_name, deck_order})
    })
    if (!response.ok) throw new Error("Could not delete deck")

    return await response.json()
  },

  reorderDecks: async (apiCall, deckOrders) => {
    const response = await apiCall(`${API_BASE_URL}/api/v1/decks/reorder`, {
      method: 'PUT',
      body: JSON.stringify({deckOrders})
    })
    if (!response.ok) throw new Error('Failed to reorder decks')
    return deckOrders
  }
}

export function useDecks() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const {apiCall, user} = useAuthContext()
  const queryClient = useQueryClient()

  const availableDecksQuery = useQuery({
    queryKey: ['decks', 'available'],
    queryFn: async () => {
      const [allDecks, ownedDecks] = await Promise.all([
        deckQueries.allDecks(),
        deckQueries.myDecks(apiCall).catch(() => []),
      ])

      const ownedDecksSet = new Set(ownedDecks.map(deck => deck.deck_name))
      const availableDecks = allDecks.filter(deck => !ownedDecksSet.has(deck.deck_name))

      return availableDecks
    },

    staleTime: 5 * 60 * 1000,
    onError: (error) => {
        console.error("Error occurred", error)
      }
  })

  const addDeckMutation = useMutation({
    mutationFn: (data) => deckMutations.addDeck(apiCall, data),
    onSuccess: (data) => {
      queryClient.setQueryData(['decks', 'available'], (old) => 
        old?.filter(deck => deck.deck_name !== data.deck_name)
      )
      queryClient.invalidateQueries(['decks', 'my', user?.id])
      },
    onError: (error) => console.log(error)
  })

  const addDecktoUser = (e, deckName, image_url) => {
    e.preventDefault()
    addDeckMutation.mutate({deck_name: deckName, image_url: image_url})
  }

  const searchDecksQuery = useQuery({
    queryKey: ['decks', 'search', debouncedSearchQuery],
    queryFn: () => deckQueries.searchDecks(debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0,
  })

  return {availableDecksQuery, addDecktoUser, searchDecksQuery, setSearchQuery, searchQuery}
}

export function useMyDecks() {
  const {apiCall, user} = useAuthContext()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const getMyDecks = useQuery({
    queryKey: ['myDecks', user?.id],
    queryFn: async () => {
      const myDecks = await deckQueries.myDecks(apiCall)
      return myDecks
    },
    staleTime: 5 * 60 * 1000
  })

  const deleteDeckMutation = useMutation({
    mutationFn: (data) => deckMutations.deleteDeck(apiCall, data),
    onSuccess: (data) => {
        queryClient.setQueryData(['myDecks', user?.id], (old) =>
      old?.filter(deck => deck.deck_name !== data.deck_name)
      )
      queryClient.invalidateQueries(['myDecks', user?.id])
      }
  })

  const deleteDeck = (e, deck_name, deck_order) => {
    e.preventDefault()
    deleteDeckMutation.mutate({deck_name, deck_order})
  }

  const searchDecksQuery = useQuery({
    queryKey: ['myDecks', 'search', user?.id, debouncedSearchQuery],
    queryFn: () => deckQueries.searchMyDecks(apiCall, debouncedSearchQuery),
    enabled: debouncedSearchQuery.length > 0,
  })

  const reorderDecksMutation = useMutation({
    mutationFn: (deckOrders) => deckMutations.reorderDecks(apiCall, deckOrders),
    onSuccess: () => {
        queryClient.refetchQueries(['myDecks', user?.id]);
    },
    onError: (error) => {
      console.error("Could not re-order decks", error);
    }
  });


  return {
    getMyDecks,
    deleteDeck,
    setSearchQuery,
    searchQuery,
    searchDecksQuery,
    reorderDecksMutation}
}
