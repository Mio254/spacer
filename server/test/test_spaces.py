import pytest

from app import create_app, db
from app.models import Space


@pytest.fixture
def app():
    """
    Creates a fresh app + in-memory DB for each test session.
    Keeps things isolated and fast.
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


def test_get_spaces_returns_empty_list(client):
    """API should return 200 even when no spaces exist"""
    response = client.get('/api/spaces')

    assert response.status_code == 200
    assert response.is_json

    data = response.get_json()
    assert isinstance(data, list)


def test_create_space_success(client):
    """Creating a valid space should succeed"""
    payload = {
        'name': 'Test Space',
        'description': 'Test description',
        'price_per_hour': 1000,
        'capacity': 10,
        'location': 'Nairobi',
    }

    response = client.post('/api/admin/spaces', json=payload)

    assert response.status_code == 201

    data = response.get_json()
    assert data['name'] == payload['name']
    assert data['price_per_hour'] == float(payload['price_per_hour'])


def test_create_space_rejects_negative_price(client):
    """
    Price should not be negative.
    Backend should return validation errors.
    """
    payload = {
        'name': 'Invalid Space',
        'price_per_hour': -50,
        'capacity': 5,
    }

    response = client.post('/api/admin/spaces', json=payload)

    assert response.status_code == 400

    data = response.get_json()
    assert 'errors' in data


def test_delete_space_marks_it_inactive_or_removes_it(client):
    """Deleting a space should remove it from queries"""
    space = Space(
        name='To Be Deleted',
        description='Temporary space',
        price_per_hour=500,
        capacity=5,
    )

    db.session.add(space)
    db.session.commit()

    response = client.delete(f'/api/admin/spaces/{space.id}')
    assert response.status_code == 200

    # Depends on implementation: soft delete vs hard delete
    deleted_space = Space.query.get(space.id)
    assert deleted_space is None or deleted_space.is_active is False


def test_get_single_space_by_id(client):
    """Should return a single space when given a valid ID"""
    space = Space(
        name='Single Space',
        description='Test',
        price_per_hour=800,
        capacity=8,
    )

    db.session.add(space)
    db.session.commit()

    response = client.get(f'/api/spaces/{space.id}')

    assert response.status_code == 200

    data = response.get_json()
    assert data['id'] == space.id
    assert data['name'] == space.name
