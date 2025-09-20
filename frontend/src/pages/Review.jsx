import "../css/reviewhome.css"
import {useReview} from "../hooks/useReview"
import ReviewHomePage from "../components/reviewHomePage"
import {SearchLoading} from "../components/Loading"
import {useAuthContext} from "../contexts/AuthContext"

export default function ReviewPage() {
  const {user} = useAuthContext();
  const {getWordCounts} = useReview()

  if (!user) {
    return <h1> Login to see this page! </h1>
  }

  if (getWordCounts.isLoading) return <h1> <SearchLoading detail={"Reviews..."} /> </h1>

  if (getWordCounts.isError) return <h1> {getWordCounts.error} </h1>

  return (
    <ReviewHomePage dueWordCount={getWordCounts.data.due_count} newWordCount={getWordCounts.data.new_count} knownWordCount={getWordCounts.data.known_count}/>
  )
}
