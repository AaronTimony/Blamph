import API_BASE_URL from "../config"
import {useMutation} from "@tanstack/react-query"
import default_pfp from "../images/default-pfp.jpeg"
import "../css/profilePictureUpload.css"

export default function useProfilePicUpload() {
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile_picture/`, {
        headers: {"Authorization" : `Bearer ${token}`},
        method: 'PATCH',
        body: formData
      })


      if (!response.ok) {
        throw new Error("Upload Failed")
      }
      const result = await response.json();

      return result
    },
    onSuccess: () => {
      console.log("Profile picture successfully changed")
    },
    onError: (error) => {console.log(error)}
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData;

    const fileInput = e.target.elements.image;
    formData.append('file', fileInput.files[0]);
    uploadMutation.mutate(formData);
  }

  return (
    <div className="Upload-file-box">
      <div className="profile-picture-image-box">
        <img src={default_pfp} alt={"profile_picture"} className="profile-picture-img" />
      </div>
      <form onSubmit={handleSubmit} className="profile-pic-submit-form">
        <label htmlFor="image"> Profile picture image: </label>
        <input type="file" name="image" />
        <button type="submit"> Upload file </button>
      </form>
    </div>
  )
}
