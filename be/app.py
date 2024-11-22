import os
from flask import Flask, send_from_directory, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from be.config import Config, ProductionConfig
import jwt

app = Flask(__name__, static_folder='../fe/build')

env_config = os.getenv('FLASK_ENV', 'development')
config_map = {
    'development': Config,
    'production': ProductionConfig
}
app.config.from_object(config_map[env_config])

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://main.dc6ojrqc09hyc.amplifyapp.com", 
            "http://localhost:3000"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

db = SQLAlchemy(app)
migrate = Migrate(app, db)

from models import User, Todo
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            return jsonify({}), 200

        token = None
        auth_header = request.headers.get('Authorization')

        if auth_header:
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)

    return decorated

# Single route for serving React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

# Authentication routes
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Invalid input'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400
    
    user = User(email=data['email'])
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    token = user.generate_token()
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email
        }
    }), 201
    
@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Invalid input'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = user.generate_token()
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email
        }
    }), 200
    
@app.route("/auth/logout", methods=["GET", "POST", "OPTIONS"])
@token_required
def logout(current_user):
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    return jsonify({"message": "Logged out successfully"}), 200

# Todos routes (using SQLAlchemy)
@app.route("/todos", methods=["GET"])
@token_required
def get_todos(current_user):
    todos = Todo.query.filter_by(user_id=current_user.id).all()
    return jsonify([todo.to_json() for todo in todos])

@app.route("/create_todos", methods=["POST"])
@token_required
def create_todo(current_user):
    todo_data = request.json
    new_todo = Todo(text=todo_data['text'], completed=todo_data['completed'], user_id=current_user.id)
    db.session.add(new_todo)
    db.session.commit()
    return jsonify(new_todo.to_json())
        
@app.route("/update_todos/<int:todo_id>", methods=["PATCH"])
@token_required
def update_todos(current_user, todo_id):
    todo = Todo.query.filter_by(id=todo_id, user_id=current_user.id).first()
    if not todo:
        return jsonify({"error": "Todo not found"}), 404

    data = request.get_json()
    if "text" in data:
        todo.text = data["text"]
    if "completed" in data:
        todo.completed = data["completed"]

    db.session.commit()
    return jsonify(todo.to_json()), 200

@app.route("/delete_todos/<int:todo_id>", methods=["DELETE"])
@token_required
def delete_todos(current_user, todo_id):
    todo = Todo.query.filter_by(id=todo_id, user_id=current_user.id).first()
    if not todo:
        return jsonify({"error": "Todo not found"}), 404
    
    db.session.delete(todo)
    db.session.commit()
    return jsonify({"message": "Todo deleted successfully"})
    
@app.route("/users", methods=["GET"])
@token_required
def get_users(current_user):
    users = User.query.all()
    return jsonify([user.to_json() for user in users])
    
@app.route("/delete_user/<int:user_id>", methods=["DELETE"])
@token_required
def delete_user(current_user, user_id):
    user = User.query.filter_by(id=user_id).first()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))