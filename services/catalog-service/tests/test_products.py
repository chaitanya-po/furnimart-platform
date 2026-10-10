
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_database_health():
    response = client.get("/db-health")

    assert response.status_code == 200
    assert response.json()["database"] == "connected"


def test_create_product():
    product = {
        "sku": f"TEST-{uuid4().hex[:12]}",
        "name": "Test Chair",
        "description": "Test product",
        "price": 1999,
        "category": "Test",
        "stock_quantity": 10,
        "is_active": True,
    }

    response = client.post("/products", json=product)

    assert response.status_code == 200

    data = response.json()

    assert data["sku"] == product["sku"]
    assert data["name"] == product["name"]
    assert data["price"] == product["price"]
    assert data["stock_quantity"] == product["stock_quantity"]


def test_get_product():
    product = {
        "sku": f"GET-{uuid4().hex[:12]}",
        "name": "Test Table",
        "description": "Product for GET test",
        "price": 4999,
        "category": "Tables",
        "stock_quantity": 5,
        "is_active": True,
    }

    create_response = client.post("/products", json=product)

    assert create_response.status_code == 200

    product_id = create_response.json()["id"]

    response = client.get(f"/products/{product_id}")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == product_id
    assert data["sku"] == product["sku"]
    assert data["name"] == product["name"]


def test_get_product_not_found():
    response = client.get("/products/999999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_update_product():
    product = {
        "sku": f"UPDATE-{uuid4().hex[:12]}",
        "name": "Original Table",
        "description": "Product for update test",
        "price": 4999,
        "category": "Tables",
        "stock_quantity": 5,
        "is_active": True,
    }

    create_response = client.post("/products", json=product)

    assert create_response.status_code == 200

    product_id = create_response.json()["id"]

    updated_product = {
        **product,
        "name": "Updated Table",
        "price": 5999,
        "stock_quantity": 12,
    }

    response = client.put(
        f"/products/{product_id}",
        json=updated_product,
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == product_id
    assert data["name"] == "Updated Table"
    assert data["price"] == 5999
    assert data["stock_quantity"] == 12


def test_delete_product():
    product = {
        "sku": f"DELETE-{uuid4().hex[:12]}",
        "name": "Product To Delete",
        "description": "Temporary product",
        "price": 999,
        "category": "Test",
        "stock_quantity": 1,
        "is_active": True,
    }

    create_response = client.post("/products", json=product)

    assert create_response.status_code == 200

    product_id = create_response.json()["id"]

    delete_response = client.delete(f"/products/{product_id}")

    assert delete_response.status_code == 200
    assert (
        delete_response.json()["message"]
        == "Product deleted successfully"
    )

    get_response = client.get(f"/products/{product_id}")

    assert get_response.status_code == 404
    assert get_response.json()["detail"] == "Product not found"
