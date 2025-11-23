from sqlalchemy.orm import Session
from .auth import hash_password
from . import models, schemas

def create_todo(db: Session, todo: schemas.TodoCreate, user_id: int):
    db_todo = models.Todo(
        title = todo.title,
        description = todo.description,
        completed = todo.completed,
        user_id = user_id
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def get_todos(db: Session, user_id: int):
    return db.query(models.Todo).filter(models.Todo.user_id == user_id).all()

def get_todo(db: Session, todo_id: int, user_id : int):
    return db.query(models.Todo).filter(models.Todo.id == todo_id,
                                        models.Todo.user_id == user_id ).first()

def update_todo(db: Session, db_todo: models.Todo, todo: schemas.TodoUpdate):

    # Update only the fields provided
    if todo.title is not None:
        db_todo.title = todo.title
    if todo.description is not None:
        db_todo.description = todo.description
    if todo.completed is not None:
        db_todo.completed = todo.completed

    db.commit()
    db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, db_todo: models.Todo):
    db.delete(db_todo)
    db.commit()
    return True

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email==email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = hash_password(user.password)
    db_user = models.User(
        email = user.email,
        hashed_password=hashed_pw
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

