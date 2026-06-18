def _create_customer(client):
    resp = client.post("/api/v1/customers/", json={"name": "Test Customer", "code": "C001"})
    return resp.json()["id"]


def test_create_order(client):
    customer_id = _create_customer(client)
    response = client.post("/api/v1/orders/", json={
        "customer_id": customer_id,
        "items": [{"product_name": "Widget", "quantity": 10, "unit_price": 5.50}]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["order_no"].startswith("ORD-")
    assert data["status"] == "pending"
    assert float(data["total_amount"]) == 55.0


def test_create_order_invalid_customer(client):
    response = client.post("/api/v1/orders/", json={
        "customer_id": 999,
        "items": [{"product_name": "Widget", "quantity": 10}]
    })
    assert response.status_code == 400


def test_list_orders(client):
    customer_id = _create_customer(client)
    client.post("/api/v1/orders/", json={
        "customer_id": customer_id,
        "items": [{"product_name": "A", "quantity": 1}]
    })
    client.post("/api/v1/orders/", json={
        "customer_id": customer_id,
        "items": [{"product_name": "B", "quantity": 2}]
    })

    response = client.get("/api/v1/orders/")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_update_order_status(client):
    customer_id = _create_customer(client)
    create_resp = client.post("/api/v1/orders/", json={
        "customer_id": customer_id,
        "items": [{"product_name": "Widget", "quantity": 1}]
    })
    order_id = create_resp.json()["id"]

    response = client.put(f"/api/v1/orders/{order_id}/status", params={"status": "confirmed"})
    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"


def test_update_order_status_invalid(client):
    customer_id = _create_customer(client)
    create_resp = client.post("/api/v1/orders/", json={
        "customer_id": customer_id,
        "items": [{"product_name": "Widget", "quantity": 1}]
    })
    order_id = create_resp.json()["id"]

    response = client.put(f"/api/v1/orders/{order_id}/status", params={"status": "bad_status"})
    assert response.status_code == 400
