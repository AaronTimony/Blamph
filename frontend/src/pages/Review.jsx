import {useState, useEffect} from "react";
import API_BASE_URL from "../config"
import {Link} from "react-router-dom";
import {useAuthContext} from "../contexts/AuthContext"
import "../css/reviewhome.css"

function ReviewPage() {
  const {apiCall, refreshAccessToken, loading, setLoading} = useAuthContext();
  const [newWordCount, setNewWordCount] = useState(0)
  const [dueWordCount, setDueWordCount] = useState(0)
  const [knownWordCount, setKnownWordCount] = useState(0)

  useEffect(() => {
    const get_word_counts = async () => {
      try{
        const response = await apiCall(`${API_BASE_URL}/api/v1/review/AllCardCounts`)

        if (!response.ok) {
          throw new Error("Failed to find new word count")
        }
        const counts = await response.json()
        setNewWordCount(counts.new_count)
        setDueWordCount(counts.due_count)
        setKnownWordCount(counts.known_count)
      } catch(error) {
        console.error("Failed to find new word count")
      } finally {
        setLoading(false)
      }
    }
      get_word_counts();
  }, [setLoading, apiCall])
 
  if (loading) {
    return <h1>Loading...</h1>
  }

  return (
    <div className="review-container">
      {/* Main content area */}
      <div className="main-content">
        {/* Top right - Words ready to review */}
        <div className="card review-card">
          <div className="card-header">
            <h2>Review Words</h2>
            <div className="icon">📚</div>
          </div>
          <div className="card-count due-count">
            {dueWordCount}
          </div>
          <div className="card-description">
            Cards waiting for your review
          </div>
        </div>

        {/* Left side - New words to learn */}
        <div className="card new-words-card">
          <div className="card-header">
            <h2>New Words</h2>
            <div className="icon">✨</div>
          </div>
          <div className="card-count new-count">
            {newWordCount}
          </div>
          <div className="card-description">
            Fresh vocabulary to discover
          </div>
        </div>
      </div>

      {/* Known words - smaller, out of the way */}
      <div className="known-words-badge">
        <div className="badge-content">
          <span className="badge-label">Known Words</span>
          <span className="badge-count">{knownWordCount}</span>
        </div>
      </div>

      {/* Start reviewing button */}
      <div className="action-section">
        <Link to="/CardReview" className="start-button-link">
          <button className="start-button">
            <span className="button-text">Start Reviewing</span>
            <span className="button-arrow">→</span>
          </button>
        </Link>
      </div>
    </div>
  )
}


export default ReviewPage;
