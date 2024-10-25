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
        result = new_todo.to_json()
        return jsonify(result), 201
    except Exception as e:
        return (
            jsonify({"error": str(e)}),
            400,
        )
        
@app.route("/update_todos/<int:todo_id>", methods=["PATCH"])
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