import {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../css/register.css";
import API_BASE_URL from "../config"
import {useAuthContext} from "../contexts/AuthContext" 

function RegisterForm({setError}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate();
  const {validateToken} = useAuthContext();

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


      if (!response.ok) {
        setError(data.message || data.detail?.[0]?.msg || data.detail || "Registration Failed")

      } else {
        setError("")
        navigate("/Decks")
        const data = await response.json()
        console.log(data, "get this")

        const {access_token, refresh_token} = data;

        const userData = await validateToken(access_token);
        console.log(userData, "got this")
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          return {success: true};
        } else {
          return {success: false, error: "Failed to register user"};
        }
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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="confirm-password">Confirm Password:</label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;
