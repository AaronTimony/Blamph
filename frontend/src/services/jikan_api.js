export const FetchTopAnime = async () => {
  try{
    const response = await fetch("https://api.jikan.moe/v4/top/anime?limit=20")
    if (!response.ok) {
      throw new Error("Failed to retrieve data")
    }
    const data = await response.json()
    return data.data.map((anime) => ({
      title: anime.title,
      image: anime.images.jpg.image_url,
      small_image: anime.images.jpg.small_image_url
    }));
  } catch(error) {
    console.error("Something went wrong:", error)
    return []
  }
}

export const SearchTopAnime = async (query) => {
  try{
    const response = await fetch(`https://api.jikan.moe/v4/top/anime?q=${encodeURIComponent(query)}`)
    if (!response.ok) {
      throw new Error("Failed to retrieve data")
    }
    const data = await response.json()
    return data.data.map((anime) => ({
      title: anime.title,
      image: anime.images.jpg.image_url,
      small_image: anime.images.jpg.small_image_url
    }));
  } catch(error) {
    console.error("Something went wrong:", error)
    return []
  }
}
