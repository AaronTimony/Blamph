const FetchTopAnime = async () => {
  try{
    const response = await fetch("https://api.jikan.moe/v4/top/anime?limit=20")
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

const createDecks = async () => {
  try{
    const token = localStorage.getItem("access_token")
    const retrieved_decks = await FetchTopAnime()
    const mappedDecks = retrieved_decks.map(deck => ({
      deck_name: deck.title,
      image_url: deck.image
    }));
    const response = await fetch("http://127.0.0.1:8000/api/v1/decks/create/", {
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

export default createDecks;
