# database.py

import os
from sqlalchemy import create_engine, Column, String, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
from dotenv import load_dotenv

# Charge les variables du fichier .env.local dans l'environnement Python
load_dotenv(".env.local")

# Récupère l'URL de connexion Neon (ex : postgresql://user:password@host/dbname)
DATABASE_URL = os.getenv("DATABASE_URL")

# Le "moteur" : l'objet qui gère la connexion réelle à la base de données
engine = create_engine(DATABASE_URL)

# Fabrique de "sessions" : une session = une conversation avec la base pour une requête donnée
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base dont vont hériter tous nos "modèles" (= tables)
Base = declarative_base()


# --- DÉFINITION DE LA TABLE "messages" ---

class Message(Base):
    __tablename__ = "messages"

    # Identifiant unique de chaque ligne (auto-incrémenté)
    id = Column(String, primary_key=True)

    # Regroupe les messages d'une même conversation
    conversation_id = Column(String, index=True)

    # "user" ou "assistant"
    role = Column(String)

    # Le texte du message
    content = Column(Text)

    # Date/heure d'envoi, remplie automatiquement
    created_at = Column(DateTime, default=datetime.utcnow)


# Crée la table dans la base si elle n'existe pas encore
def init_db():
    Base.metadata.create_all(bind=engine)