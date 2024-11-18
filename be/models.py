# models.py
from main import db
import jwt
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    todos = db.relationship('Todo', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def generate_token(self):
        return jwt.encode(
            {'user_id': self.id, 'exp': datetime.utcnow() + timedelta(days=1)},
            'your-secret',
            algorithm='HS256'
        )

    def to_json(self):
        return {
            'id': self.id,
            'email': self.email
        }

class Todo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    done = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_json(self):
        return {
            'id': self.id,
            'title': self.title,
            'done': self.done,
            'user_id': self.user_id
        }