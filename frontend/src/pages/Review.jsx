import {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useAuthContext} from "../contexts/AuthContext"

function ReviewPage() {
  const {authorizedFetch} = useAuthContext();
  const [newWordCount, setNewWordCount] = useState(0)
  const [dueWordCount, setDueWordCount] = useState(0)
  const [knownWordCount, setKnownWordCount] = useState(0)

  useEffect(() => {
    const get_word_counts = async () => {
      try{
        const response = await authorizedFetch("http://127.0.0.1:8000/api/v1/review/AllCardCounts")

        if (!response.ok) {
          throw new Error("Failed to find new word count")
        }
        const counts = await response.json()
        setNewWordCount(counts.new_count)
        setDueWordCount(counts.due_count)
        setKnownWordCount(counts.known_count)
      } catch(error) {
        console.error("Failed to find new word count")
      }
    }
      get_word_counts();
  }, [])

  
  return (
    <>
      <div>
        <h1>New Words: {newWordCount}</h1>
        <h1>Known Words: {knownWordCount}</h1>
        <h1>Due Words: {dueWordCount}</h1>
      </div>

      <Link to="/CardReview">
        <button className="Enter-Reviews" >Click to start reviewing</button>
      </Link>

    </>
  )
}

export default ReviewPage;
