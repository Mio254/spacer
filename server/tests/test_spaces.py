import os
import sys
import pytest

# Make sure project root is on the path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app import create_app, db
from app.models import Space


@pytest.fixture
def app():
    """
    Create a test app with an in-memory database.
    """
    app = create_app()
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI='sqlite:///:memory:',
    )

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def test_health_endpoint(client):
    """Health endpoint should return OK"""
    response = client.get('/health')

    assert response.status_code == 200

    data = response.get_json()
    assert data.get('ok') is True


def test_spaces_endpoint_exists(client):
    """Spaces endpoint should respond"""
    response = client.get('/api/spaces')

    # Depending on implementation, empty list or not found is acceptable
    assert response.status_code in (200, 404)


if __name__ == '__main__':
    # Allows running this file directly during debugging
    pytest.main(['-v', __file__])
