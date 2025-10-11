import "../css/reviewpage.css"
import {useReview} from "../hooks/useReview"

export function CardReview({found_due_card, found_new_card, showMeaning, setShowMeaning}) {
  const {postNewCardRating, postReviewCardRating} = useReview();

  const current_card = found_due_card.jp_word ? found_due_card : found_new_card

  const isCardNew = !found_due_card.jp_word && !!found_new_card.jp_word

  const handleRating = (rating) => {
    if (isCardNew) {
      postNewCardRating.mutate({japWord: current_card.jp_word, rating})
    } else {
      postReviewCardRating.mutate({japWord: current_card.jp_word, rating})
    }
  }

  return (
    <div className="card-review-container">
      <div className="flashcard">
        <div className={`card-content ${showMeaning ? 'show-answer' : ''}`}>
          <div className="japanese-word">{current_card.jp_word}</div>

          {!showMeaning ? (
            <button className="show-meaning-btn" onClick={() => setShowMeaning(true)}>
              Show meaning
            </button>
          ) : (
              <>
                <div className="meaning">{current_card.meaning[0]}</div>
                <div className="reading">{current_card.reading}</div>

                <div className="rating-buttons">
                  {!isCardNew ? (
                    <>
                      <button className="rating-btn easy" onClick={() => handleRating("Easy")}>
                        Easy
                      </button>
                      <button className="rating-btn hard" onClick={() => handleRating("Hard")}>
                        Hard
                      </button>
                      <button className="rating-btn again" onClick={() => handleRating("Again")}>
                        Again
                      </button>
                    </>
                  ) : (
                      <>
                        <button className="rating-btn know" onClick={() => handleRating("I know this word")}>
                          I know this word
                        </button>
                        <button className="rating-btn dont-know" onClick={() => handleRating("I do not know this word")}>
                          I don't know this word
                        </button>
                      </>
                    )}
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  )
}
export default CardReview;
