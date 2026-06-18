def test_create_customer(client):
    response = client.post("/api/v1/customers/", json={
        "name": "Test Customer",
        "code": "CUST001",
        "level": "vip",
        "email": "test@example.com"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Customer"
    assert data["code"] == "CUST001"
    assert data["level"] == "vip"
    assert data["status"] == "active"


def test_list_customers(client):
    client.post("/api/v1/customers/", json={"name": "Customer 1", "code": "C001"})
    client.post("/api/v1/customers/", json={"name": "Customer 2", "code": "C002"})

    response = client.get("/api/v1/customers/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_customer(client):
    create_resp = client.post("/api/v1/customers/", json={"name": "Test", "code": "C001"})
    customer_id = create_resp.json()["id"]

    response = client.get(f"/api/v1/customers/{customer_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test"


def test_get_customer_not_found(client):
    response = client.get("/api/v1/customers/999")
    assert response.status_code == 404


def test_update_customer(client):
    create_resp = client.post("/api/v1/customers/", json={"name": "Old Name", "code": "C001"})
    customer_id = create_resp.json()["id"]

    response = client.put(f"/api/v1/customers/{customer_id}", json={"name": "New Name"})
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"


def test_delete_customer(client):
    create_resp = client.post("/api/v1/customers/", json={"name": "Test", "code": "C001"})
    customer_id = create_resp.json()["id"]

    response = client.delete(f"/api/v1/customers/{customer_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Customer deleted"

    get_resp = client.get(f"/api/v1/customers/{customer_id}")
    assert get_resp.status_code == 404
