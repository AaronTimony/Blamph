import "../css/reviewhome.css"
import {WordSearchReviewPage} from "../components/nextReviewWord.jsx"
import {useReview} from "../hooks/useReview"
import {SearchLoading} from "../components/Loading"
import {Link} from "react-router-dom"

export default function ReviewHomePage({dueWordCount, newWordCount, knownWordCount, current_streak, longest_streak}) {
  const {
    getNewCard,
    getReviewCard,
  } = useReview()

  const isPending = getNewCard.isPending || getReviewCard.isPending
  
  const isLoading = getNewCard.isFetching ||
    getReviewCard.isFetching 

  if (isPending || isLoading) return <SearchLoading detail={"Reviews..."} />

  const displayNewWordCount = newWordCount <= 0 ? "Done" : newWordCount;

  const displayReviewWordCount = dueWordCount <= 0 ? "Done" : dueWordCount;

  const current_card = getReviewCard.data.jp_word ? getReviewCard.data : getNewCard.data


return (
    <div className="review-home-container">
      <div className="stats-grid">
        {/* Words to Review */}
        <div className="stat-component">
          <div className="stat-title-box">
            <h2 className="stat-title">Words to Review</h2>
          </div>
          <div className="stat-card">
            <div className="stat-icon-section review-icon">
              <span className="icon-text">📝</span>
            </div>
            <div className="stat-value-section">
              <div className="stat-value review-value">{displayReviewWordCount}</div>
              <div className="stat-subtitle">Due today</div>
            </div>
          </div>
        </div>

        {/* Words Known */}
        <div className="stat-component">
          <div className="stat-title-box">
            <h2 className="stat-title">Words Known</h2>
          </div>
          <div className="stat-card">
            <div className="stat-icon-section known-icon">
              <span className="icon-text">✓</span>
            </div>
            <div className="stat-value-section">
              <div className="stat-value known-value">{knownWordCount}</div>
              <div className="stat-subtitle">Total mastered</div>
            </div>
          </div>
        </div>

        {/* New Words */}
        <div className="stat-component">
          <div className="stat-title-box">
            <h2 className="stat-title">New Words</h2>
          </div>
          <div className="stat-card">
            <div className="stat-icon-section new-icon">
              <span className="icon-text">✨</span>
            </div>
            <div className="stat-value-section">
              <div className="stat-value new-value">{displayNewWordCount}</div>
              <div className="stat-subtitle">Ready to learn</div>
            </div>
          </div>
        </div>
      </div>
      <div className="bottom-section">
        <div className="word-search-section">
          <WordSearchReviewPage word={current_card} />
        </div>

        <div className="quick-stats-section">
          <div className="quick-stat-item">
            <div className="quick-stat-label">Current Streak</div>
            <div className="quick-stat-value">{current_streak}</div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-label">Today's Progress</div>
            <div className="quick-stat-value">24/42</div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-label">Accuracy</div>
            <div className="quick-stat-value">85%</div>
          </div>
        </div>

      </div>
      <Link to="/CardReview" className="start-button-link">
        <button className="start-review-button">
          Start Reviews
        </button>
      </Link>
    </div>
  );
}
