import {ReviewStats} from "../components/userProfileStats"
import ProfilePictureUpload from "../components/profilePictureUpload"
import "../css/userProfilePage.css"

export default function UserProfile() {

  return (
    <div className="profile-page-container">
      <ProfilePictureUpload />
      <ReviewStats />
    </div>
  )
}
