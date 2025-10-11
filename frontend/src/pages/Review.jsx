import "../css/reviewhome.css"
import {useReviewPage} from "../hooks/useReview"
import ReviewHomePage from "../components/reviewHomePage"
import {SearchLoading} from "../components/Loading"
import {useAuthContext} from "../contexts/AuthContext"
import {useState} from "react"
import SearchBar from "../components/searchBar"
import {useSearch} from "../hooks/useSearch"
import {WordSearch} from "../components/wordSearchResults"
import {WelcomePage} from "../components/welcomePage.jsx"
import {ReviewPageNoDecks} from "../components/reviewPageNoDecks.jsx"
import {useSearchParams} from "react-router-dom"


export default function ReviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchedWord = searchParams.get('search') || "";
  const {user, loading} = useAuthContext();
  const {getUserInfo} = useReviewPage()

  const {searchAllWords, addWordToPriorityQueue} = useSearch(searchedWord);

  if (loading) {
    return <h1><SearchLoading detail={"Reviews..."} /></h1>
  }

  if (!user) {
    return <WelcomePage />
  }

  const handleSearch = (query) => {
    if (query) {
      setSearchParams({search: query});
    } else {
      setSearchParams({});
    }
  }



  if (getUserInfo.isLoading) return <h1> <SearchLoading detail={"Reviews..."} /> </h1>

  if (getUserInfo.isError) return <h1> {getUserInfo.error} </h1>

  if (searchedWord && searchAllWords.isLoading) return <h1> <SearchLoading detail={"Words..."} /> </h1>

  if (!getUserInfo.data.user_owns_decks) return <ReviewPageNoDecks />;

  return (
    <>
      <SearchBar onSearch={handleSearch} detail={"Words"}/>
      {searchedWord ? (
        <WordSearch words={searchAllWords.data} addWordToPriorityQueue={addWordToPriorityQueue}/>
      ) : (
          <ReviewHomePage dueWordCount={getUserInfo.data.due_count} newWordCount={getUserInfo.data.new_count} knownWordCount={getUserInfo.data.known_count} current_streak={getUserInfo.data.current_streak} longest_streak={getUserInfo.data.longest_streak}/>
        )}
    </>
  )
}
