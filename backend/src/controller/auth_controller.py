from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from src.models.user import User
from src.services.auth import hash_password, verify_password, create_access_token

def register_user(username: str,email: str, password: str, db: Session):
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    existing_email = db.query(User).filter(User.email == email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

    hashed_password = hash_password(password)
    new_user = User(
        username=username,
        email=email,
        password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully",
            "user": {
              "id": new_user.id
            , "user_id": new_user.id
           , "username": new_user.username
           }
    }

def login_user(username: str, password: str, db: Session):
    # Find user by username and verify their hashed password
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    access_token = create_access_token(
        data={"username": user.username, "user_id": user.id}
    )
    return {"access_token": access_token, "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
    }
