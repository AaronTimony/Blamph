import {useState} from "react";
import "../css/register.css"

function RegisterForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    try{
      const response = await fetch("https://blamph.onrender.com/api/v1/users/register", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({username, email, password, full_name: fullName})
      })
      if (!response.ok) {
        throw new Error("Failed to create user")

      } 
      alert("User has been created!")
    } catch(error) {
      console.log("Failed to create user", error.message)
      alert("Failed to create user!")
    }
  }
  return (
    <div className="register-form">
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="fullName">Full Name:</label>
        <input
          id="fullName"
          type="text"
          placeholder="Enter full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
