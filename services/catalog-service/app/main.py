from fastapi import FastAPI, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import engine
from app.models import Product
from app.schemas import ProductCreate

app = FastAPI(
    title="FurniMart Catalog Service",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {
        "service": "catalog-service",
        "status": "healthy",
    }


@app.get("/db-health")
def database_health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "service": "catalog-service",
        "database": "connected",
    }


@app.get("/")
def root():
    return {
        "service": "catalog-service",
        "message": "FurniMart Catalog Service is running",
    }


@app.post("/products")
def create_product(product: ProductCreate):
    with Session(engine) as session:
        new_product = Product(
            sku=product.sku,
            name=product.name,
            description=product.description,
            price=product.price,
            category=product.category,
            stock_quantity=product.stock_quantity,
            is_active=product.is_active,
        )

        session.add(new_product)
        session.commit()
        session.refresh(new_product)

        return {
            "id": new_product.id,
            "sku": new_product.sku,
            "name": new_product.name,
            "description": new_product.description,
            "price": float(new_product.price),
            "category": new_product.category,
            "stock_quantity": new_product.stock_quantity,
            "is_active": new_product.is_active,
        }


@app.get("/products")
def get_products():
    with Session(engine) as session:
        products = session.query(Product).all()

        return [
            {
                "id": product.id,
                "sku": product.sku,
                "name": product.name,
                "description": product.description,
                "price": float(product.price),
                "category": product.category,
                "stock_quantity": product.stock_quantity,
                "is_active": product.is_active,
            }
            for product in products
        ]


@app.get("/products/{product_id}")
def get_product(product_id: int):
    with Session(engine) as session:
        product = session.get(Product, product_id)

        if product is None:
            raise HTTPException(
                status_code=404,
                detail="Product not found",
            )

        return {
            "id": product.id,
            "sku": product.sku,
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "category": product.category,
            "stock_quantity": product.stock_quantity,
            "is_active": product.is_active,
        }


@app.put("/products/{product_id}")
def update_product(product_id: int, product_data: ProductCreate):
    with Session(engine) as session:
        product = session.get(Product, product_id)

        if product is None:
            raise HTTPException(
                status_code=404,
                detail="Product not found",
            )

        product.sku = product_data.sku
        product.name = product_data.name
        product.description = product_data.description
        product.price = product_data.price
        product.category = product_data.category
        product.stock_quantity = product_data.stock_quantity
        product.is_active = product_data.is_active

        session.commit()
        session.refresh(product)

        return {
            "id": product.id,
            "sku": product.sku,
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "category": product.category,
            "stock_quantity": product.stock_quantity,
            "is_active": product.is_active,
        }


@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    with Session(engine) as session:
        product = session.get(Product, product_id)

        if product is None:
            raise HTTPException(
                status_code=404,
                detail="Product not found",
            )

        session.delete(product)
        session.commit()

        return {
            "message": "Product deleted successfully",
            "id": product_id,
        }