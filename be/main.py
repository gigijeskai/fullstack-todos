from flask import request, jsonify
from config import app, db
from models import Todo, User
from functools import wraps
import jwt

# Auth

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Remove bearer from token
            token = token.split(' ')[1]
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
def get_todos():
    todos = Todo.query.all()
    json_todos = list(map(lambda todo: todo.to_json(), todos))
    return jsonify({"todos": json_todos}), 200

@app.route("/create_todos", methods=["POST"])
@token_required
def create_todos():
    title = request.json.get("title")
    done = False
    
    if not title:
        return (
            jsonify({"error": "Invalid input"}), 
            400,
        )
        
    new_todo = Todo(
        title=title,
        done=done
    )
    try:
        db.session.add(new_todo)
        db.session.commit()
        result = new_todo.to_json()
        return jsonify(result), 201
    except Exception as e:
        return (
            jsonify({"error": str(e)}),
            400,
        )
        
@app.route("/update_todos/<int:todo_id>", methods=["PATCH"])
@token_required
def update_todos(todo_id):
    todo = Todo.query.get(todo_id)
    
    if not todo:
        return (
            jsonify({"error": "Todo not found"}), 
            404,
        )
        
    data = request.json
    todo.title = data.get("title", todo.title)
    todo.done = data.get("done", todo.done)
    
    try:
        db.session.commit()
        return jsonify(todo.to_json()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/delete_todos/<int:todo_id>", methods=["DELETE"])
@token_required
def delete_todos(todo_id):
    todo = Todo.query.get(todo_id)
    
    if not todo:
        return (
            jsonify({"error": "Todo not found"}), 
            404,
        )
        
    db.session.delete(todo)
    db.session.commit()
    
    return jsonify({"message": "Todo deleted successfully"}), 200
    
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    
    app.run(debug=True)