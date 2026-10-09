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
        "sku": "TEST-002",
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

    assert data["sku"] == "TEST-002"
    assert data["name"] == "Test Chair"
    assert data["price"] == 1999
    assert data["stock_quantity"] == 10


def test_get_product():
    response = client.get("/products/1")

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["sku"] == "SOFA-001"


def test_get_product_not_found():
    response = client.get("/products/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Product not found"


def test_update_product():
    product = {
        "sku": "SOFA-001",
        "name": "Updated Sofa",
        "description": "Updated test sofa",
        "price": 21999,
        "category": "Sofas",
        "stock_quantity": 20,
        "is_active": True,
    }

    response = client.put("/products/1", json=product)

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == 1
    assert data["name"] == "Updated Sofa"
    assert data["price"] == 21999
    assert data["stock_quantity"] == 20


def test_delete_product():
    product = {
        "sku": "DELETE-001",
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
    assert delete_response.json()["message"] == "Product deleted successfully"

    get_response = client.get(f"/products/{product_id}")

    assert get_response.status_code == 404