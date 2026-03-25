from passlib.context import CryptContext
#passlib is a password hashing library for Python
#cryptcontext is a class in passlib that provides a high-level interface for hashing and verifying passwords
from jose import JWTError, jwt
#jose is a JavaScript Object Signing and Encryption library for Python
#JWTError is an exception class in jose that is raised when there is an error with JWT
#jwt is a module in jose that provides functions for encoding and decoding JSON Web Tokens
from datetime import datetime, timedelta
#datetime is a module in Python that provides classes for manipulating dates and times
import os
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "your_default_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
    
# This file provides authentication services such as password hashing, token creation, and token verification
# It uses passlib for secure password hashing and jose for handling JSON Web Tokens (JWT)
# The SECRET_KEY and other configurations are loaded from environment variables for security
# This helps to keep sensitive information out of the source code
# The create_access_token function generates a JWT token with an expiration time
# The verify_token function decodes and verifies the JWT token
# Overall, this file is essential for managing user authentication in a secure manner
# It ensures that user passwords are stored securely and that tokens are properly issued and validated
