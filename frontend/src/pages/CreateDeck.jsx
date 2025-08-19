import {useState} from "react"
import "../css/addFile.css"

function CreateDeck() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [deckName, setDeckName] = useState("")

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files)); // this is a FileList
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!deckName) {
      alert("Please enter a deck name!");
      return;
    }

    const formData = new FormData();
    formData.append("deck_name", deckName)
    selectedFiles.forEach((file) => {
      formData.append("files", file); 
    })

    try{
      const token = localStorage.getItem("token")
      const response = await fetch("http://127.0.0.1:8000/api/v1/words/addSubs", {
      method: "POST",
      headers: {
          "Authorization" : `Bearer ${token}`
        },
      body: formData
    })

    const data = await response.json()
      console.log("Upload success:", data);
    } catch(error) {
      console.error("Upload failed:", error)
    }
  };

  return (
    <div className="create-deck-form">
      <div className="form-container">
        <h2 className="form-title">Create New Deck</h2>
        
        <form onSubmit={handleUpload}>
          <div className="input-group">
            <label className="input-label">Deck Name</label>
            <input
              type="text"
              className="text-input"
              placeholder="Enter deck name"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Upload Files</label>
            <div className="file-input-container">
              <input
                type="file"
                id="file-input"
                className="file-input"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="file-input" className="file-input-label">
                <span className="file-input-icon">📁</span>
                <span>
                  {selectedFiles.length > 0 
                    ? `${selectedFiles.length} file(s) selected` 
                    : "Choose files or drag them here"
                  }
                </span>
              </label>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="file-list">
              <div className="file-list-title">Selected Files:</div>
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  {file.name}
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="upload-button">
            Create Deck
          </button>
        </form>
      </div>
    </div>
  )
};
export default CreateDeck;
