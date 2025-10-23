import {useState} from "react";
import {useNavigate} from "react-router-dom";
import "../css/register.css";
import API_BASE_URL from "../config"
import {useAuthContext} from "../contexts/AuthContext" 
import {useMutation} from "@tanstack/react-query"
import {SearchLoading} from "../components/Loading"

function RegisterForm({setError}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate();
  const {validateToken} = useAuthContext();


  const registerUser = useMutation({
    mutationFn: async ({user_data}) => {
      console.log(user_data)
      const response = await fetch(`${API_BASE_URL}/api/v1/users/register`, {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(user_data)
      })

      const data = await response.json()
      

      if (!response.ok) {
        throw new Error(data.message || data.detail?.[0]?.msg || data.detail || "Registration Failed")
      } 

      return data;
    },
    onSuccess: async (data) => { 
      const {access_token, refresh_token} = data;

      const userData = await validateToken(access_token);

      if (userData) {
        navigate("/Decks")
        window.location.reload()
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        return {success: true};
      } else {
        throw new Error("Failed to register User")
      }
    },
    onError: (error) => {
      setError(error.message)
      console.error(error.message)
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user_data = {
      username,
      email,
      password,
      confirm_password: confirmPassword
    }
    registerUser.mutate({user_data})
  }

  if (registerUser.isPending) return <SearchLoading detail={"User Registration..."} />

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
