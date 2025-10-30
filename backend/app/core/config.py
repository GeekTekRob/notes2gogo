from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://notes_user:notes_password@localhost/notes2gogo"
    test_database_url: str = (
        "postgresql://notes_user:notes_password@localhost/notes2gogo_test"
    )

    # JWT
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # App
    environment: str = "development"
    debug: bool = True
    app_name: str = "Notes2GoGo API"
    version: str = "1.0.0"

    class Config:
        env_file = ".env"


settings = Settings()
