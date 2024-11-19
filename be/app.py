import os
from flask import Flask, send_from_directory, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from config import config

app = Flask(__name__)
# Configure CORS for development
if app.config['DEBUG']:
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
else:
    CORS(app, resources={r"/api/*": {
        "origins": ["https://fullstack-todos-sigma.vercel.app"]
    }})

db = SQLAlchemy(app)
migrate = Migrate(app, db)

from models import User, Todo
from functools import wraps
import jwt

# Auth

def token_required(f): # decorator to check if the user is authenticated
    @wraps(f) # preserve the metadata of the original function
    def decorated(*args, **kwargs): # the function that will be called when the decorator is used
        if request.method == "OPTIONS": # handle preflight requests
            return jsonify({}), 200 # return an empty response with status code 200

        token = None # inirialize token to None
        auth_header = request.headers.get('Authorization') # get the Authorization header from the request

        if auth_header:
            try:
                token = auth_header.split(" ")[1] # get the token from the header
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, 'your-secret', algorithms=['HS256']) # decode the token
            current_user = User.query.get(data['user_id']) # get the user from the database
        except Exception as e:
            return jsonify({'message': 'Token is invalid', 'error' : str(e)}), 401 # return an error if the token is invalid

        return f(current_user, *args, **kwargs) # call the function with the user as argument

    return decorated

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json() # get the json data from the request
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Invalid input'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 400
    
    user = User()
    user.email = data['email']
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
    data = request.get_json() 
    
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
        
    # Handle both GET and POST requests
    try:
        # Add any logout logic here (like token invalidation if needed)
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Routes for Todos

@app.route("/todos", methods=["GET", "OPTIONS"])
@token_required
def get_todos(current_user):
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    try:
        todos = Todo.query.filter_by(user_id=current_user.id).all()
        return jsonify([todo.to_json() for todo in todos])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route("/create_todos", methods=["POST"])
@token_required
def create_todos(current_user):
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"message": "Invalid input"}), 400

    try:
        new_todo = Todo( # create a new todo object with the model in model.py
            title=data["title"],
            done=False,
            user_id=current_user.id
        )
        db.session.add(new_todo) # add the new todo to the database
        db.session.commit() # commit the transaction
        return jsonify(new_todo.to_json()), 201
    except Exception as e:
        db.session.rollback() # if an error occurs, rollback the transaction
        return jsonify({"message": str(e)}), 500
        
@app.route("/update_todos/<int:todo_id>", methods=["PATCH", "OPTIONS"])
@token_required
def update_todos(current_user, todo_id):
    if request.method == "OPTIONS":
        return jsonify({}), 200
        
    try:
        todo = Todo.query.filter_by(id=todo_id, user_id=current_user.id).first()
        if not todo:
            return jsonify({"error": "Todo not found"}), 404

        data = request.get_json()
        if "title" in data:
            todo.title = data["title"]
        if "done" in data:
            todo.done = data["done"]

        db.session.commit()
        return jsonify(todo.to_json()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route("/delete_todos/<int:todo_id>", methods=["DELETE"])
@token_required
def delete_todos(current_user, todo_id):
    try:
        todo = Todo.query.filter_by(id=todo_id, user_id=current_user.id).first()
    
        if not todo:
            return (jsonify({"error": "Todo not found"}), 404,
        )
        
        db.session.delete(todo)
        db.session.commit()
        return jsonify({"message": "Todo deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
# Route for Users

@app.route("/users", methods=["GET"])
@token_required
def get_users(current_user):
    try:
        users = User.query.all()
        return jsonify([user.to_json() for user in users])
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@app.route("/delete_user/<int:user_id>", methods=["DELETE"])
@token_required
def delete_user(current_user, user_id):
    try:
        user = User.query.filter_by(id=user_id ).first()
    
        if not user:
            return (jsonify({"error": "User not found"}), 404,
        )
        
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.after_request
def after_request(response):
    if app.config['DEBUG']:
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    else:
        response.headers.add('Access-Control-Allow-Origin', 'https://your-app-name.vercel.app')  # Replace with your Vercel domain
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Serve React App
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")
    
if __name__ == "__main__":
    app.run()

    
    