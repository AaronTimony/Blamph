import {useState} from "react";

function NewUser() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [usersList, setUsersList] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:8000/register/", {
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
      const response = await fetch("http://127.0.0.1:8000/users/", {
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

  </>
  );
}

export default NewUser
