import LoginForm from "../components/loginForm"
import FormError from "../components/formError"
import {useState} from "react"

function LoginPage() {
  const [error, setError] = useState("")
  return (
    <div>
      
      <LoginForm setError={setError}/>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        
        <FormError error={error}/>
      </div>
    </div>
  )
}
export default LoginPage;
