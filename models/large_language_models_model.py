# models/large_language_models_model.py

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class ModelProvider(db.Model):
    __tablename__ = 'model_providers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.text, nullable=False)
    base_url = db.Column(db.Text, nullable=True)
    api_key = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<ModelProvider {self.name}>'

class LargeLanguageModel(db.Model):
    __tablename__ = 'large_language_models'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.text, nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('model_providers.id'), nullable=False)

    # Relationship to the provider
    provider = db.relationship('ModelProvider', backref='models')

    def __repr__(self):
        return f'<LargeLanguageModel {self.name}>'