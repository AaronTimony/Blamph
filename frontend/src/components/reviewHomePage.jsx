import "../css/reviewhome.css"
import {WordSearchReviewPage} from "../components/nextReviewWord.jsx"
import {useReview} from "../hooks/useReview"
import {SearchLoading} from "../components/Loading"
import {Link} from "react-router-dom"
import grad_hat from "../images/graduation-hat-icon.png"
import new_words_icon from "../images/new_words_icon.png"
import review_icon from "../images/review-icon.png"
import tick_icon from "../images/tick-icon.png"

export default function ReviewHomePage({dueWordCount, newWordCount, knownWordCount, current_streak}) {
  const {
    getNewCard,
    getReviewCard,
  } = useReview()

  const isPending = getNewCard.isPending || getReviewCard.isPending
  
  const isLoading = getNewCard.isFetching ||
    getReviewCard.isFetching 

  if (isPending || isLoading) return <SearchLoading detail={"Reviews..."} />

  const displayNewWordCount = newWordCount <= 0 ? <img src={tick_icon} alt={"✔"} className="tick-icon-image" /> : newWordCount;

  const displayReviewWordCount = dueWordCount <= 0 ? <img src={tick_icon} alt={"✔"} className="tick-icon-image" /> : dueWordCount;

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
              <span className="icon-text">
                <img src={review_icon} alt="" className="review-icon-img" />
              </span>
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
              <span className="icon-text">
                <img src={grad_hat} alt="✔" className="grad-hat-img" />
              </span>
            </div>
            <div className="stat-value-section">
              <div className="stat-value known-value">{knownWordCount}</div>
              <div className="stat-subtitle">Total mastered</div>
            </div>
          </div>
        </div>

        <div className="stat-component">
          <div className="stat-title-box">
            <h2 className="stat-title">New Words</h2>
          </div>
          <div className="stat-card">
            <div className="stat-icon-section new-icon">
              <span className="icon-text">
                <img src={new_words_icon} alt="✨" className="new-words-img" />
              </span>
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
