import "../css/registrationFormError.css"

function FormError({error}) {
  if (!error) return null;
  return (
    <div className="error-message">
      {error}
    </div>
  )
}

export default FormError;
