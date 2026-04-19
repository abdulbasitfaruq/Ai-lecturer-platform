import pytest
import time
from httpx import AsyncClient, ASGITransport
from main import app

BASE_URL = "http://test"

def unique(prefix):
    return f"{prefix}_{int(time.time() * 1000) % 100000}"

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        response = await client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

@pytest.mark.asyncio
async def test_register_user():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        u = unique("reg")
        response = await client.post("/auth/register", json={
            "username": u,
            "email": f"{u}@test.com",
            "password": "testpass123"
        })
    assert response.status_code == 200
    assert "user" in response.json()

@pytest.mark.asyncio
async def test_register_duplicate_username():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        u = unique("dup")
        await client.post("/auth/register", json={"username": u, "email": f"{u}@test.com", "password": "testpass123"})
        response = await client.post("/auth/register", json={"username": u, "email": f"{u}2@test.com", "password": "testpass123"})
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_register_missing_field():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        response = await client.post("/auth/register", json={"username": "missingfield", "password": "testpass123"})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_login_valid():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        u = unique("login")
        await client.post("/auth/register", json={"username": u, "email": f"{u}@test.com", "password": "testpass123"})
        response = await client.post("/auth/login", json={"username": u, "password": "testpass123"})
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_wrong_password():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        u = unique("wrongpass")
        await client.post("/auth/register", json={"username": u, "email": f"{u}@test.com", "password": "testpass123"})
        response = await client.post("/auth/login", json={"username": u, "password": "wrongpassword"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_lectures_empty():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        response = await client.get("/lectures/user/99999")
    assert response.status_code == 200
    assert "lectures" in response.json()

@pytest.mark.asyncio
async def test_save_lecture_missing_field():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        response = await client.post("/lectures/save", json={"topic": "Missing fields test"})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_save_and_get_lecture():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        u = unique("saveget")
        await client.post("/auth/register", json={"username": u, "email": f"{u}@test.com", "password": "testpass123"})
        login = await client.post("/auth/login", json={"username": u, "password": "testpass123"})
        user_id = login.json()["user"]["id"]

        save = await client.post("/lectures/save", json={
            "topic": "Test Topic",
            "subject": "Computer Science",
            "difficulty": "beginner",
            "content": "This is test lecture content for pytest testing.",
            "user_id": user_id,
            "audio_file": None,
            "visual_url": None
        })
        assert save.status_code == 200
        assert "lecture" in save.json()

        get = await client.get(f"/lectures/user/{user_id}")
        assert get.status_code == 200
        assert len(get.json()["lectures"]) >= 1

@pytest.mark.asyncio
async def test_ask_and_get_questions():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        u = unique("qa")
        await client.post("/auth/register", json={"username": u, "email": f"{u}@test.com", "password": "testpass123"})
        login = await client.post("/auth/login", json={"username": u, "password": "testpass123"})
        user_id = login.json()["user"]["id"]

        save = await client.post("/lectures/save", json={
            "topic": "Biology",
            "subject": "Biology",
            "difficulty": "beginner",
            "content": "Plants use photosynthesis to make food from sunlight.",
            "user_id": user_id,
            "audio_file": None,
            "visual_url": None
        })
        lecture_id = save.json()["lecture"]["id"]

        ask = await client.post("/qa/ask", json={
            "lecture_id": lecture_id,
            "user_id": user_id,
            "question_text": "What is photosynthesis?"
        })
        assert ask.status_code == 200
        assert "question" in ask.json()

        get_q = await client.get(f"/qa/lectures/{lecture_id}/questions")
        assert get_q.status_code == 200
        assert "questions" in get_q.json()

@pytest.mark.asyncio
async def test_stream_endpoint_responds():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as client:
        response = await client.post("/lectures/stream", json={
            "topic": "Arrays",
            "subject": "Computer Science",
            "difficulty": "beginner",
            "voice": "onyx"
        })
    assert response.status_code == 200
