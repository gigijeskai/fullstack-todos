from flask import request, jsonify
from config import app, db
from models import Todo

@app.route("/todos", methods=["GET"])
def get_todos():
    todos = Todo.query.all()
    json_todos = list(map(lambda todo: todo.to_json(), todos))
    return jsonify({"todos": json_todos}), 200

@app.route("/create_todos", methods=["POST"])
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
    except Exception as e:
        return (
            jsonify({"error": str(e)}),
            400,
        )
        
    return jsonify({"message": "Todo created successfully"}), 201
    
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    
    app.run(debug=True)