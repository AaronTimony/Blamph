import {useParams} from "react-router-dom"
import {useQuery} from "@tanstack/react-query"
import {useAuthContext} from "../contexts/AuthContext"
import API_BASE_URL from "../config"

export default function DeckDetails() {
  const {deck_name} = useParams();
  const {apiCall} = useAuthContext();

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


  const words = wordsQuery.data

  console.log(words)

  if (wordsQuery.isPending) return <h1>Loading...</h1>

  if (wordsQuery.isError) return <h1>{wordsQuery.error}</h1>

  return (
    <>
      <h1>{deck_name}</h1>
      
      <div>
        {words.map((word, index) => (
          <p key={index}> - {word.meaning} - {word.jp_word} - {word.word_frequency}</p>
        ))}
      </div>
    </>
  )
}
