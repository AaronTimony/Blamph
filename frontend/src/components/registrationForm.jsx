import {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../css/register.css";
import API_BASE_URL from "../config"

function RegisterForm({setError}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    const userData = {
      username,
      email,
      password,
      confirm_password: confirmPassword
    }

    try{
      const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || data.detail?.[0]?.msg || data.detail || "Registration Failed")

      } else {
        setError("")
        navigate("/Login")
      }

    } catch(error) {
      console.log("Failed to create user", error.message)
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

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="confirm-password">Confirm Password:</label>
        <input
          id="confirm-password"
          type="password"
          placeholder="Please Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
