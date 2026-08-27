"""Main Application Entry Point for Wordle Game & AI Solver Backend"""

import os
from flask import Flask, jsonify
from extensions import db, cors
from config import config_by_name
from services.game_service import GameService

# Import blueprints
from routes.auth_routes import auth_bp
from routes.game_routes import game_bp
from routes.solver_routes import solver_bp
from routes.stats_routes import stats_bp
from routes.analyzer_routes import analyzer_bp
from routes.multigrid_routes import multigrid_bp
from routes.battle_routes import battle_bp
from routes.achievement_routes import achievement_bp

def create_app(config_name=None):
    """Application factory for Wordle Backend."""
    if not config_name:
        config_name = os.getenv('FLASK_ENV', 'development')
        
    app = Flask(__name__)
    config_cls = config_by_name.get(config_name, config_by_name['default'])
    app.config.from_object(config_cls)
    
    # Initialize extensions
    cors.init_app(app, resources={r"/*": {"origins": "*"}})
    db.init_app(app)
    
    # Initialize Game and Solver services
    app.game_service = GameService(app.config['DATA_DIR'])
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(game_bp)
    app.register_blueprint(solver_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(analyzer_bp)
    app.register_blueprint(multigrid_bp)
    app.register_blueprint(battle_bp)
    app.register_blueprint(achievement_bp)
    
    # Health check route
    @app.route('/health', methods=['GET'])
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Wordle Advanced AI & Multi-Grid Engine API',
            'version': '2.5.0'
        }), 200

    # Auto-initialize database tables and demo data if needed
    with app.app_context():
        db.create_all()
        _seed_demo_data()

    return app

def _seed_demo_data():
    """Seed initial sample players for leaderboard demonstration if database is empty."""
    from models import User
    if User.query.count() == 0:
        demo_users = [
            ('wordmaster', 'wordmaster@example.com', 'Alex', 'Rivera', 'password123', 850, 15, 12, 5, 8),
            ('vocabqueen', 'vocabqueen@example.com', 'Sarah', 'Chen', 'password123', 720, 12, 10, 4, 6),
            ('entropy_bot', 'entropy@example.com', 'Claude', 'Shannon', 'password123', 950, 18, 16, 8, 10),
            ('puzzleking', 'puzzleking@example.com', 'Marcus', 'Vance', 'password123', 600, 10, 8, 3, 5),
        ]
        for username, email, fn, ln, pwd, score, played, won, cstreak, mstreak in demo_users:
            u = User(
                username=username,
                email=email,
                firstname=fn,
                lastname=ln,
                score=score,
                games_played=played,
                games_won=won,
                current_streak=cstreak,
                max_streak=mstreak,
                guess_1=1,
                guess_2=3,
                guess_3=4,
                guess_4=2,
                guess_5=1,
                guess_6=1
            )
            u.set_password(pwd)
            db.session.add(u)
        db.session.commit()

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1')
    print(f"🚀 Wordle Game & AI Solver Backend running on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
