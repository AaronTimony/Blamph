import RegisterForm from "../components/registrationForm"
import FormError from "../components/formError"
import {useState} from "react"

function RegisterPage() {
  const [error, setError] = useState("")

  return (
    <div>
      <RegisterForm setError={setError}/>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <FormError error={error}/>
      </div>
    </div>
  )
}

export default RegisterPage;
