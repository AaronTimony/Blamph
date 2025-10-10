import {useQuery} from "@tanstack/react-query"
import {useAuthContext} from "../contexts/AuthContext"
import API_BASE_URL from "../config"
import {SearchLoading} from "../components/Loading"
import "../css/reviewStats.css"

export function ReviewStats() {
  const {apiCall} = useAuthContext();
  const getReviewValues = useQuery({
    queryKey: ["ReviewValues"],
    queryFn: async () => {
      const response = await apiCall(`${API_BASE_URL}/api/v1/review/ReviewStatValues`)
      
      if (!response.ok) throw new Error("Failed to get review stats")

      const data = response.json()

      return data
    }
  })

  if (getReviewValues.isLoading) return <SearchLoading detail={"Profile"} />

  return (
    <div className="Review-stats">
      <h1> Daily Reviews: {getReviewValues.data.daily_reviews} </h1>
      <h1> Weekly Reviews: {getReviewValues.data.weekly_reviews} </h1>
      <h1> All Time Reviews: {getReviewValues.data.all_time_reviews} </h1>
    </div>
  )
}
