import JapaneseWordCards from "../components/wordDetailsCard"
import "../css/JapaneseWordCards.css"
import useWords from "../hooks/useWords"
import {SearchLoading} from "../components/Loading"

export default function DeckDetails() {
  const {wordsQuery, deck_name} = useWords();

  const words = wordsQuery.data

  if (wordsQuery.isPending) return <h1><SearchLoading detail={"Words"}/></h1>

  if (wordsQuery.isError) return <h1>{wordsQuery.error}</h1>

  return (
  <JapaneseWordCards words={words} deck_name={deck_name} />
  )
}
