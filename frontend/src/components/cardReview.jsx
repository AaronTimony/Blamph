import API_BASE_URL from "../config"
import {useAuthContext} from "../contexts/AuthContext"
import "../css/reviewpage.css"
import {useState, useEffect} from "react";

export function CardReview({found_due_card, found_new_card}) {
  const {apiCall} = useAuthContext();
  const [japWord, setJapWord] = useState("")
  const [meaning, setMeaning] = useState("")
  const [reading, setReading] = useState("")
  const [showMeaning, setShowMeaning] = useState(false)
  const [rating, setRating] = useState("")
  const [isCardNew, setIsCardNew] = useState(false)
  useEffect(() => {
    check_for_reviews();

    setRating("")
  }, [rating])

  const check_for_reviews = async () => {

    if (found_due_card.jp_word) {
      setJapWord(found_due_card.jp_word)
      setMeaning(found_due_card.meaning)
      setReading(found_due_card.reading)
      setIsCardNew(false)
    } else if (found_new_card.jp_word) {
      setJapWord(found_new_card.jp_word)
      setMeaning(found_new_card.meaning)
      setReading(found_new_card.reading)
      setIsCardNew(true)
    } else {
      console.log("Could not find new or due cards")
    }
  }


  useEffect(() => {
    if (!rating) return;
    const send_rating = async () => {
      if (isCardNew) {
        try{
          const response = await apiCall(`${API_BASE_URL}/api/v1/review/newcardrating`, {
            method: "POST",
            body: JSON.stringify({"jp_word" : japWord, "rating" : rating})
          })

          if (!response.ok) {
            throw new Error("Could not patch with new rating")
          }

        } catch(error) {
          console.error("Could not establish new rating in data", error)
        }
      } else {
        try{
          const response = await apiCall(`${API_BASE_URL}/api/v1/review/reviewcardrating`, {
            method: "PATCH",
            body: JSON.stringify({"jp_word" : japWord, "rating": rating})
          })

          if (!response.ok) {
            throw new Error("Could not patch with new rating")
          }
        } catch(error) {
          console.error("Could not establish new rating in data", error)
        }
      }
    }
    send_rating();
    setShowMeaning(false)
  }, [rating])


  const show_meaning_click = async () => {
    setShowMeaning(true)
    console.log(reading)
  }

  return (
    <div className="card-review-container">
      <div className="flashcard">
        <div className={`card-content ${showMeaning ? 'show-answer' : ''}`}>
          <div className="japanese-word">{japWord}</div>

          {!showMeaning ? (
            <button className="show-meaning-btn" onClick={show_meaning_click}>
              Show meaning
            </button>
          ) : (
              <>
                <div className="meaning">{meaning}</div>
                <div className="reading">{reading}</div>

                <div className="rating-buttons">
                  {!isCardNew ? (
                    <>
                      <button className="rating-btn easy" onClick={() => setRating("Easy")}>
                        Easy
                      </button>
                      <button className="rating-btn hard" onClick={() => setRating("Hard")}>
                        Hard
                      </button>
                      <button className="rating-btn again" onClick={() => setRating("Again")}>
                        Again
                      </button>
                    </>
                  ) : (
                      <>
                        <button className="rating-btn know" onClick={() => setRating("I know this word")}>
                          I know this word
                        </button>
                        <button className="rating-btn dont-know" onClick={() => setRating("I do not know this word")}>
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
