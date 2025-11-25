import JapaneseWordCards from "../components/wordDetailsCard"
import {useAuthContext} from "../contexts/AuthContext"
import useWords from "../hooks/useWords"
import SearchBar from "../components/searchBar"
import {SearchLoading} from "../components/Loading"
import {Pagination} from "../components/pagination"
import {useSearchinDeck} from "../hooks/useSearch"
import {useState} from "react"

export default function DeckDetails() {
  const [searchQuery, setSearchQuery] = useState("")
  const [deckSortMethod, setDeckSortMethod] = useState("deck_frequency")
  const {wordsQuery, deck_name, page} = useWords(deckSortMethod);
  const {user} = useAuthContext();
  const {searchWordsinDeck} = useSearchinDeck(searchQuery, deck_name)

  if (!user) {
    return (
      <>
        <h1 style={{textAlign: 'center'}}> {deck_name} </h1>
        <h2 style={{ textAlign: 'center' }}> Please sign in to see the words contained in this deck!</h2>
      </>
    )
  }
  const words = wordsQuery.data

  if (wordsQuery.isPending) return <h1><SearchLoading detail={"Words"}/></h1>

  if (wordsQuery.isError) return <h1>{wordsQuery.error}</h1>

  if (searchWordsinDeck.isLoading) return <h1><SearchLoading detail={"Words"} /></h1>

  const total_pages = (words && words.length > 0 && words[0].total_pages ? words[0].total_pages : 0)

  return (
    <>
      <SearchBar onSearch={setSearchQuery} detail={"Words"}/>
      
      {searchQuery ? (
        <JapaneseWordCards words={searchWordsinDeck.data} deck_name={deck_name} deckSortMethod={deckSortMethod} />
      ) : (
          <>
            <JapaneseWordCards words={words} deck_name={deck_name} deckSortMethod={deckSortMethod} setDeckSortMethod={setDeckSortMethod}/>
            <Pagination deck_name={deck_name} cur_page={Number(page)} total_pages={total_pages}/>
          </>
        )}
    </>
  )
}
