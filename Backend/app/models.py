from typing import Optional, List
from pydantic import BaseModel


class User(BaseModel):
    id: Optional[int]
    name: str


class Product(BaseModel):
    id: Optional[int]
    name: str
    category: Optional[str] = None


class Interaction(BaseModel):
    id: Optional[int]
    user_id: int
    product_id: int
    rating: Optional[int] = 1
