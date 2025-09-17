import "../css/reviewhome.css"
import {useReview} from "../hooks/useReview"
import ReviewHomePage from "../components/reviewHomePage"
import {SearchLoading} from "../components/Loading"

export default function ReviewPage() {
  const {getWordCounts} = useReview()

  if (getWordCounts.isLoading) return <h1> <SearchLoading detail={"Reviews..."} /> </h1>

  if (getWordCounts.isError) return <h1> {getWordCounts.error} </h1>

  return (
    <ReviewHomePage dueWordCount={getWordCounts.data.due_count} newWordCount={getWordCounts.data.new_count} knownWordCount={getWordCounts.data.known_count}/>
  )
}
