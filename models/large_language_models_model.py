# This python code will contain the database model for the large language models that are accessible using this application

# models/large_language_models_model.py

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class LargeLanguageModel(db.Model):
    __tablename__ = 'large_language_models'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    base_url = db.Column(db.String(255), nullable=True)
    api_key = db.Column(db.String(255), nullable=True)

    def __repr__(self):
        return f'<LargeLanguageModel {self.name}>'