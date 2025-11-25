import API_BASE_URL from "../config"

export const fetchTopAnime = async () => {
  try{
    const response = await fetch(`https://api.jikan.moe/v4/top/anime?limit=10/`)

    if (!response.ok) {
      throw new Error("Failed to retrieve data")
    }
    const data = await response.json()
  
    return data.data.map((anime) => ({
      title: anime.title,
      image: anime.images.jpg.image_url,
    }));

  } catch(error) {
    console.error("Something went wrong:", error)
    return []
  }
}

export const createDecks = async () => {
  try{
    const token = localStorage.getItem("access_token")
    const retrieved_decks = await fetchTopAnime()
    const mappedDecks = retrieved_decks.map(deck => ({
      deck_name: deck.title,
      image_url: deck.image
    }));
    const response = await fetch(`${API_BASE_URL}/api/v1/decks/create/`, {
      method: "POST",
      headers: {"Content-Type" : "application/json", "Authorization" : `Bearer ${token}`},
      body: JSON.stringify(mappedDecks)
    })
    if (!response.ok) {
      throw new Error("Failed to create new decks in database")
    }
  } catch(error) {
    console.error("Something went wrong", error)
  }
}

export const callAPI = async () => {
  try{
    const response = await fetch(`http://localhost:8000/subtitles/useAPI?deck_id=1&episodes=5-10/`)
    if (!response.ok) {
      throw new Error("Failed to create new decks in database")
    }
    const data = await response.json()

    return data
  } catch(error) {
    console.error("Something went wrong", error)
  }
}
