import {CardReview} from "../components/cardReview"
import {useReview} from "../hooks/useReview"
import {useState, useEffect} from "react"
import {SearchLoading} from "../components/Loading"

function CardReviewPage() {
  const [showMeaning, setShowMeaning] = useState(false)

  const {
    getNewCard,
    getReviewCard,
  } = useReview()

  const isPending = getNewCard.isPending || getReviewCard.isPending
  
  const isLoading = getNewCard.isFetching || getReviewCard.isFetching 


  useEffect(() => {
    if (!isLoading) {
      setShowMeaning(false);
    }
  }, [isLoading])

  if (isPending) return <SearchLoading detail={"Words..."} />

  return (
    <CardReview found_due_card={getReviewCard.data} 
      found_new_card={getNewCard.data}
      showMeaning={showMeaning}
      setShowMeaning={setShowMeaning}/>
  )
}

export default CardReviewPage;
