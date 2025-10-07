import "../css/reviewhome.css"
import {useReviewPage} from "../hooks/useReview"
import ReviewHomePage from "../components/reviewHomePage"
import {SearchLoading} from "../components/Loading"
import {useAuthContext} from "../contexts/AuthContext"
import {useState} from "react"
import SearchBar from "../components/searchBar"
import {useSearch} from "../hooks/useSearch"
import {WordSearch} from "../components/wordSearchResults"

export default function ReviewPage() {
  const [searchedWord, setSearchWord] = useState("")
  const {user, loading} = useAuthContext();
  const {getUserInfo} = useReviewPage()

  const {searchAllWords, addWordToPriorityQueue} = useSearch(searchedWord);

  if (loading) {
    return <h1><SearchLoading detail={"Reviews..."} /></h1>
  }

  if (!user) {
    return <h1> Login to see this page! </h1>
  }

  if (getUserInfo.isLoading) return <h1> <SearchLoading detail={"Reviews..."} /> </h1>

  if (getUserInfo.isError) return <h1> {getUserInfo.error} </h1>

  if (searchedWord && searchAllWords.isLoading) return <h1> <SearchLoading detail={"Words..."} /> </h1>

  console.log(getUserInfo.data)
  return (
    <>
      <SearchBar onSearch={setSearchWord} detail={"Words"}/>
      {searchedWord ? (
        <WordSearch words={searchAllWords.data} addWordToPriorityQueue={addWordToPriorityQueue}/>
      ) : (
          <ReviewHomePage dueWordCount={getUserInfo.data.due_count} newWordCount={getUserInfo.data.new_count} knownWordCount={getUserInfo.data.known_count} current_streak={getUserInfo.data.current_streak} longest_streak={getUserInfo.data.longest_streak}/>
        )}
    </>
  )
}
