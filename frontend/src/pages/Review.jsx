import "../css/reviewhome.css"
import {useReview} from "../hooks/useReview"
import ReviewHomePage from "../components/reviewHomePage"
import {SearchLoading} from "../components/Loading"
import {useAuthContext} from "../contexts/AuthContext"
import {useState} from "react"
import SearchBar from "../components/searchBar"
import {useSearch} from "../hooks/useSearch"
import {WordSearch} from "../components/wordSearchResults"

export default function ReviewPage() {
  const [searchedWord, setSearchWord] = useState("")
  const {user} = useAuthContext();
  const {getWordCounts} = useReview()
  const {searchAllWords, addWordToPriorityQueue} = useSearch(searchedWord);

  if (!user) {
    return <h1> Login to see this page! </h1>
  }

  if (getWordCounts.isLoading) return <h1> <SearchLoading detail={"Reviews..."} /> </h1>

  if (getWordCounts.isError) return <h1> {getWordCounts.error} </h1>

  if (searchedWord && searchAllWords.isLoading) return <h1> <SearchLoading detail={"Words..."} /> </h1>


  return (
    <>
      <SearchBar onSearch={setSearchWord} detail={"Words"}/>
      {searchedWord ? (
      <WordSearch words={searchAllWords.data} addWordToPriorityQueue={addWordToPriorityQueue}/>
      ) : (
      <ReviewHomePage dueWordCount={getWordCounts.data.due_count} newWordCount={getWordCounts.data.new_count} knownWordCount={getWordCounts.data.known_count}/>
      )}
    </>
  )
}
