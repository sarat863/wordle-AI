import pytest
import sys
import os

# Add parent directory to path so imports resolve cleanly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from extensions import db
from models import User

@pytest.fixture
def app():
    test_app = create_app('testing')
    with test_app.app_context():
        db.create_all()
        yield test_app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_token(client):
    res = client.post('/api/auth/register', json={
        'username': 'tester',
        'email': 'tester@example.com',
        'password': 'password123',
        'firstname': 'Test',
        'lastname': 'User'
    })
    data = res.get_json()
    return data['token']
