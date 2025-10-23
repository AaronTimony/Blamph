import "../css/registrationFormError.css"

function FormError({error}) {
  if (!error) return null;
  console.log(error, "ASBHDNASD")
  return (
    <div className="error-message">
      {error}
    </div>
  )
}

export default FormError;
