import pytest
import asyncio
import os
import sys
import httpx

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

@pytest.mark.asyncio
async def test_api_endpoints():
    from app.core.database import engine, Base, AsyncSessionLocal
    from app.data.pdeu_seed import seed_pdeu_data
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_pdeu_data(session)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        # 2. Public overview
        res = await client.get("/api/v1/public/overview")
        assert res.status_code == 200
        assert "Pandit Deendayal Energy University" in res.json()["university_name"]

        # 3. Personas
        res = await client.get("/api/v1/auth/personas")
        assert res.status_code == 200
        personas = res.json()
        assert len(personas) >= 3

        # 4. Login as Dhwani
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "dhwani@pdeu.ac.in",
            "password": "pdeu2026",
            "organization_id": "PDEU"
        })
        assert login_res.status_code == 200
        token_data = login_res.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 5. Documents list
        docs_res = await client.get("/api/v1/documents", headers=headers)
        assert docs_res.status_code == 200
        docs = docs_res.json()
        assert len(docs) >= 3

        # 6. Knowledge Graph data
        graph_res = await client.get("/api/v1/knowledge/graph", headers=headers)
        assert graph_res.status_code == 200
        gdata = graph_res.json()
        assert len(gdata["nodes"]) > 0
        assert len(gdata["edges"]) > 0

        # 7. Ask Anveshan query
        chat_res = await client.post("/api/v1/chat/query", headers=headers, json={
            "question": "Can I take Machine Learning next semester?",
            "organization_id": "PDEU"
        })
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert chat_data["status"] == "ANSWERED"
        assert len(chat_data["citations"]) > 0

        # 8. Admin conflicts
        conf_res = await client.get("/api/v1/admin/conflicts", headers=headers)
        assert conf_res.status_code == 200
        assert len(conf_res.json()) >= 1

    print("\n[API TESTS PASSED] All FastAPI endpoints verified successfully!")

if __name__ == "__main__":
    asyncio.run(test_api_endpoints())
