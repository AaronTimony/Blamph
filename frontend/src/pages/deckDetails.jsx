import JapaneseWordCards from "../components/wordDetailsCard"
import "../css/JapaneseWordCards.css"
import useWords from "../hooks/useWords"
import {SearchLoading} from "../components/Loading"
import {Pagination} from "../components/pagination"
import {useState} from "react"

export default function DeckDetails() {
  const [deckSortMethod, setDeckSortMethod] = useState("deck_frequency")
  const {wordsQuery, deck_name, page} = useWords(deckSortMethod);

  const words = wordsQuery.data

  if (wordsQuery.isPending) return <h1><SearchLoading detail={"Words"}/></h1>

  if (wordsQuery.isError) return <h1>{wordsQuery.error}</h1>

  const total_pages = (words && words.length > 0 && words[0].total_pages ? words[0].total_pages : 0)

  return (
    <>
      <JapaneseWordCards words={words} deck_name={deck_name} deckSortMethod={deckSortMethod} setDeckSortMethod={setDeckSortMethod}/>
      <Pagination deck_name={deck_name} cur_page={Number(page)} total_pages={total_pages}/>

    </>
  )
}
