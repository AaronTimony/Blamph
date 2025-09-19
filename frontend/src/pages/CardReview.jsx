import {CardReview} from "../components/cardReview"
import {useReview} from "../hooks/useReview"

function CardReviewPage() {
  const {getNewCard, getReviewCard} = useReview()

  if (getNewCard.isPending) return <h1> LOADING... </h1>
  if (getReviewCard.isPending) return <h1> LOADING... </h1>

  return (
    <CardReview found_due_card={getReviewCard.data} found_new_card={getNewCard.data} />
  )
}

export default CardReviewPage;
