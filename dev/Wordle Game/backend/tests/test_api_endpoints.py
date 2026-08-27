import pytest

def test_health_check(client):
    res = client.get('/health')
    assert res.status_code == 200
    assert res.get_json()['status'] == 'healthy'

def test_auth_registration_and_login(client):
    # Register
    reg_res = client.post('/api/auth/register', json={
        'username': 'newplayer',
        'email': 'newplayer@example.com',
        'password': 'secretpassword',
        'firstname': 'New',
        'lastname': 'Player'
    })
    assert reg_res.status_code == 201
    reg_data = reg_res.get_json()
    assert 'token' in reg_data
    assert reg_data['user']['username'] == 'newplayer'

    # Duplicate username should fail
    dup_res = client.post('/api/auth/register', json={
        'username': 'newplayer',
        'email': 'another@example.com',
        'password': 'secretpassword'
    })
    assert dup_res.status_code == 409

    # Login
    login_res = client.post('/api/auth/login', json={
        'username': 'newplayer',
        'password': 'secretpassword'
    })
    assert login_res.status_code == 200
    assert 'token' in login_res.get_json()

def test_game_flow_and_guess(client, auth_token):
    # Start game session
    start_res = client.post('/api/game/new', json={'mode': 'practice', 'wordLength': 5},
                            headers={'Authorization': f'Bearer {auth_token}'})
    assert start_res.status_code == 200
    session_data = start_res.get_json()
    session_id = session_data['sessionId']
    assert session_id is not None

    # Submit valid guess
    guess_res = client.post('/api/game/guess', json={
        'sessionId': session_id,
        'guess': 'CRANE'
    }, headers={'Authorization': f'Bearer {auth_token}'})
    
    assert guess_res.status_code == 200
    guess_data = guess_res.get_json()
    assert 'result' in guess_data
    assert len(guess_data['result']) == 5
    assert guess_data['guessNumber'] == 1

def test_leaderboard_endpoint(client):
    res = client.get('/api/leaderboard/global')
    assert res.status_code == 200
    data = res.get_json()
    assert 'leaderboard' in data
    assert isinstance(data['leaderboard'], list)

def test_solver_recommend_endpoint(client):
    res = client.post('/api/solver/recommend', json={
        'wordLength': 5,
        'history': [{'guess': 'CRANE', 'result': ['absent', 'absent', 'correct', 'absent', 'absent']}]
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'recommendations' in data
    assert 'remainingCount' in data
