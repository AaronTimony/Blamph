import {useAuthContext} from "../contexts/AuthContext"
import API_BASE_URL from "../config"
import {useState} from "react";
import {useNavigate} from "react-router-dom"
import "../css/login.css"
function LoginForm() {
  const {login} = useAuthContext();
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(username, password)
    if (result.success) {
      console.log("User has logged in")
      navigate('/Review')
    } else {
      console.error(result.error)
    }

  }

  return (
  <div className="Login-form">
      <form onSubmit={handleSubmit} className="submit-form">
        <label htmlFor="username">Username:</label>
        <input
        type="text"
        id="Username-Field"
        placeholder="Please Enter Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        />
      <label htmlFor="password">Password:</label>
      <input
      id="Password-Input"
      type="password"
      placeholder="Please Enter Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
      </form>
  </div>
  )
}

export default LoginForm;
