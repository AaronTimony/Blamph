from pydantic import BaseModel, EmailStr, validator

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    confirm_password: str

    @validator('password')
    def validate_password(cls, password):
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long.")

        if password.lower() == password:
            raise ValueError("Password must contain at least one capital letter.")

        if not any(char.isdigit() for char in password):
            raise ValueError("Password must contain at least one number.")

        return password

    @validator('username')
    def validate_username(cls, username):
        if len(username) < 5:
            raise ValueError("Username must be at least 5 characters.")
        return username

    @validator('confirm_password')
    def validate_confirm_password(cls, confirm_password, values):
        password = values.get('password')
        if values.get('password') and values.get('password') != confirm_password:
            raise ValueError("Passwords do not match")

        return confirm_password
            
        


