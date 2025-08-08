from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str
    DATABASE_URL: str

    class Config:
        env_file = "app/core/.env"

settings = Settings()
