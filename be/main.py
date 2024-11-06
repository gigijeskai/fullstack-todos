from flask import request, jsonify
from config import app, db
from models import Todo, User
from functools import wraps
import jwt

# Auth

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
            data = jwt.decode(token, 'your-secret', algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid'}), 401

        return f(current_user, *args, **kwargs)

    return decorated

@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    
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

# Routes for Todos

@app.route("/todos", methods=["GET"])
@token_required
def get_todos(current_user):
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
        new_todo = Todo(
            title=data["title"],
            done=False,
            user_id=current_user.id
        )
        db.session.add(new_todo)
        db.session.commit()
        return jsonify(new_todo.to_json()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
        
@app.route("/update_todos/<int:todo_id>", methods=["PATCH"])
@token_required
def update_todos(current_user, todo_id):
    try:
        todo = Todo.query.filter_by(id=todo_id, user_id=current_user.id).first()
        if not todo:
            return jsonify({"error": "Todo not found"}), 404,
   
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
    
if __name__ == "__main__":
    app.run(debug=True)
    
    