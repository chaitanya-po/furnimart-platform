from pydantic import BaseModel


class ProductCreate(BaseModel):
    sku: str
    name: str
    description: str | None = None
    price: float
    category: str
    stock_quantity: int = 0
    is_active: bool = True