import {useState} from "react";

function NewUser() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [usersList, setUsersList] = useState([])
  const [addDeckSearch, setAddDeckSearch] = useState("")
  const [addUserDeckSearch, setAddUserDeckSearch] = useState("")
  const [createDeck, setCreateDeck] = useState("")
  const [addWordDeck, setAddWordDeck] = useState("")
  const [addWordDeckDeck, setAddWordDeckDeck] = useState("")
  const [wordsUsername, setWordsUsername] = useState("")
  const [listWords, setListWords] = useState([])
  const [deleteDeckSearch, setDeleteDeckSearch] = useState("")
  const [deleteDeckName, setDeleteDeckName] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:8000/api/v1/users/register/", {
      method: "POST",
    headers: { "Content-Type" : "application/json"},
    body: JSON.stringify({username, email, password}),
  });

    alert(`Added user ${username} with password ${password} to database`)

    setUsername("");
    setEmail("");
    setPassword("");
  }

  const getUsers = async (e) => {
      e.preventDefault()
    try{
      const response = await fetch("http://127.0.0.1:8000/api/v1/users/", {
        method: "GET",
        headers: {"Content-Type": "application/json"},
      });

      if (!response.ok) {
      throw new Error('Failed to Retrieve data');
    }
    const users = await response.json()
    console.log("Retrieved Users:", users)
    setUsersList(users);
    } catch(error) {
      console.error("Failed to retrieve users:", error);
      alert("Retrieve Failed")
    }
  };

  const addDeckUser = async (e) => {
    e.preventDefault()
    try{
      const response = await fetch(`http://127.0.0.1:8000/api/v1/users/AddDeck/${addUserDeckSearch}/deck/${addDeckSearch}`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
      });

      if (!response.ok) {
        throw new Error("Failed to add Deck")
      }
    } catch (error) {
      alert("Error:" + error.message);

    }
    setAddDeckUserSearch("")
    setAddDeckSearch("")
  }
  const createNewDeck = async (e) => {
    e.preventDefault()
    try{
      const response = await fetch(`http://127.0.0.1:8000/api/v1/decks/create/${createDeck}`, {
        method: "POST",
        Headers: {"Content-Type" : "application/json"},
      })
      if (!response.ok) {
        throw new Error("Failed to post data");
      }
    } catch(error) {
      alert("Error:" + error.message);
    }
    
  }

  const addWordToDeck = async (e) => {
    e.preventDefault()
    try{
      const response = await fetch(`http://127.0.0.1:8000/api/v1/words/add/${addWordDeck}/${addWordDeckDeck}`, {
        method: "POST",
        Headers: {"Content-Type" : "application/json"},
      })
      if (!response.ok) {
        throw new Error("Failed to post data");
      } 
    } catch(error) {
      alert("Error:" + error.message);
    }
  }

  const getUserWords = async (e) => {
    e.preventDefault()
    try{
      const response = await fetch(`http://127.0.0.1:8000/api/v1/users/${wordsUsername}/words`)

      if (!response.ok) {
        throw new Error("failed to retrieve data")
      }

      const userWords = await response.json()

      setListWords(userWords)

    } catch(error) {
      alert("Error:" + error.message)
    }
  }

  const deleteDeck = async (e) => {
    e.preventDefault()
    try{
      const response = await fetch(`http://127.0.0.1:8000/api/v1/decks/delete/${deleteDeckSearch}/${deleteDeckName}`, {
        method: "DELETE",
        headers: {"Content-Type" : "application/json"},
      })
      if (!response.ok) {
        throw new Error("Could not Delete Deck")
      }
    } catch(error) {
      alert("Error:" + error.message)
    }
  }
  

  return (
  <>
  <form onSubmit={handleSubmit}>
    <label htmlFor="text">Username:</label>
    <input
      id="username"
      placeholder="Username"
      name="username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
        required
      />
      <label htmlFor="email">Email:</label>
      <input
        id="email"
        name="email"
        placeholder="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label htmlFor="password">Password:</label>
      <input
        placeholder="password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required />
      <button type="submit">Register</button>
    </form>
    <form onSubmit={getUsers}>
      <button type="submit">Retrieve All users</button>
      <div>
          <p> Found {usersList.length} Users:</p>

          {usersList.map((username) => (
            <p> {username}</p>
          ))}
        </div>
    </form>
    <form onSubmit={addDeckUser}>
        <label htmlFor="text">Username:</label>
        <input
        id="userDeckInput"
        placeholder="username"
        value={addUserDeckSearch}
        onChange = {(e) => setAddUserDeckSearch(e.target.value)}
        />
        <label htmlFor="text">Deck Name:</label>
        <input
        id="deckNameInput"
        placeholder="Deck Name"
        value={addDeckSearch}
        onChange={(e) => setAddDeckSearch(e.target.value)}
        />
      <button type="submit">Add Deck</button>
      </form>
      <form onSubmit={createNewDeck}>
        <label htmlFor="text">Deck name:</label>
        <input
        id="newDeckInput"
        placeholder="Deck Name"
        value={createDeck}
        onChange={(e) => setCreateDeck(e.target.value)}
        />
        <button type="submit">Create Deck</button>
      </form>

      <form onSubmit={addWordToDeck}>
        <label htmlFor="text">Word:</label>
        <input
        placeholder="Word to Add"
        value={addWordDeck}
        onChange={(e) => setAddWordDeck(e.target.value)}
        />
        <label htmlFor="text">Deck:</label>
        <input
        placeholder="Deck"
        value={addWordDeckDeck}
        onChange={(e) => setAddWordDeckDeck(e.target.value)}
        />
        <button type="submit">Click to add Word</button>
      </form>
      <form onSubmit={getUserWords}>
        <label htmlFor="text">Username:</label>
        <input
        placeholder="Find words for User"
        value={wordsUsername}
        onChange={(e) => setWordsUsername(e.target.value)}
        />
        <button type="submit">Find Words</button>
      <div>
          <p>Found {listWords.length} words</p>

         {listWords.map((word) => (
         <p key={word}>{word}</p>
         ))}
      </div>
      </form>
      <form onSubmit={deleteDeck}>
        <label htmlFor="text">Username:</label>
        <input
        id="deleteDeckUsernameInput"
        placeholder="Enter username"
        value={deleteDeckSearch}
        onChange={(e) => setDeleteDeckSearch(e.target.value)}
        />
        <label htmlFor="text">Deck Name:</label>
        <input
        id="deleteDeckName"
        placeholder="Deck you want to Delete"
        value={deleteDeckName}
        onChange={(e) => setDeleteDeckName(e.target.value)}
        />
        <button type="submit">Delete this Deck</button>
      </form>
  </>
  );
}

export default NewUser
