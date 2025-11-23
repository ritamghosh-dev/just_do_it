from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import engine, get_db
from .auth import verify_password, create_access_token, get_current_user
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/todos", response_model=schemas.TodoResponse)
def create_new_todo(
    todo: schemas.TodoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return crud.create_todo(db, todo, user_id=current_user.id)


@app.get("/todos", response_model=list[schemas.TodoResponse])
def list_todos(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return crud.get_todos(db, user_id=current_user.id)

@app.get("/todos/{todo_id}", response_model=schemas.TodoResponse)
def read_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    db_todo = crud.get_todo(db, todo_id, user_id=current_user.id)
    if db_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )
    return db_todo

@app.put("/todos/{todo_id}", response_model=schemas.TodoResponse)
def update_todo(todo_id: int, todo: schemas.TodoUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_todo = crud.get_todo(db, todo_id, user_id=current_user.id)
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return crud.update_todo(db, db_todo, todo)

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    db_todo = crud.get_todo(db, todo_id, user_id=current_user.id)
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    crud.delete_todo(db, db_todo)
    return {"message": "Todo deleted successfully"}

@app.post("/auth/register", response_model=schemas.UserResponse)
def register( user : schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user= crud.get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user=crud.create_user(db, user)

    return new_user

@app.post("/auth/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    if not verify_password(user.password,db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    token = create_access_token({"user_id" : db_user.id})

    return {"access token": token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user = Depends(get_current_user)):
    return current_user