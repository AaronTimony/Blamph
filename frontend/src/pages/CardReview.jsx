import {CardReview} from "../components/cardReview"
import {useReview} from "../hooks/useReview"

function CardReviewPage() {
  const {
    getNewCard, 
    getReviewCard,
    postNewCardRating,
    postReviewCardRating
  } = useReview()

  const isLoading = getNewCard.isPending ||
    getReviewCard.isPending ||
    postNewCardRating.isPending ||
    postReviewCardRating.isPending;


  if (isLoading) return <h1> LOADING... </h1>

  return (
    <CardReview found_due_card={getReviewCard.data} found_new_card={getNewCard.data} />
  )
}

export default CardReviewPage;
