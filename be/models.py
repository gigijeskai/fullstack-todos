from config import db

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), unique=True, nullable=False)
    done = db.Column(db.Boolean, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "title": self.title,
            "done": self.done
        }