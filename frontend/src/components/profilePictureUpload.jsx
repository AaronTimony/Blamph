import API_BASE_URL from "../config"
import {useMutation} from "@tanstack/react-query"

export default function useProfilePicUpload() {
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/api/v1/users/profile_picture`, {
        headers: {"Authorization" : `Bearer ${token}`},
        method: 'POST',
        body: formData
      })


      if (!response.ok) {
        throw new Error("Upload Failed")
      }
      console.log("WE ARE DOING IT??")
      const result = await response.json();

      return result
    },
    onSuccess: (data) => {
      console.log("Upload Success", data)
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
      <form onSubmit={handleSubmit} className="profile-pic-submit-form">
        <label htmlFor="image"> Profile picture image: </label>
        <input type="file" name="image" />
        <button type="submit"> Upload file </button>
      </form>
    </div>
  )
}
