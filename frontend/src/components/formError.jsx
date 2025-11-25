import "../css/registrationFormError.css"

function FormError({error, className}) {
  if (!error) return null;
  return (
    <div className={className}>
      {error}
    </div>
  )
}

export default FormError;
