#   --- IMPORTS ---

import os
import uuid
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

#   On récupère ce qu'on a construit dans database.py :
#   init_db()     -> crée les tables si elles n'existent pas
#   SessionLocal  -> fabrique de connexions à la base
#   Message       -> le modèle représentant une ligne de la table "messages"
from database import init_db, SessionLocal, Message

#   Charge les variables du fichier .env.local (GEMINI_API_KEY, CORS_ORIGINS...)
load_dotenv(".env.local")


#   --- CRÉATION DE L'APPLICATION ---

app = FastAPI()

#   Crée les tables PostgreSQL si elles n'existent pas encore (une seule fois au démarrage)
init_db()

#   Client Gemini, configuré avec la clé API récupérée dans .env.local
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


#   --- AUTORISER LE FRONTEND À APPELER LE BACKEND (CORS) ---

#   Sans ça, le navigateur bloque les requêtes venant de http://localhost:5173
#   vers http://localhost:8000, car ce sont deux origines différentes (port différent)
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


#   --- FORME DES DONNÉES REÇUES DU FRONTEND ---

#   Pydantic valide automatiquement que "message" est bien du texte,
#   et que "conversation_id" est soit une chaîne, soit absent (None par défaut)
class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
@app.post("/chat")
def chat(request: ChatRequest):
    #   Si aucun conversation_id n'est fourni, on en génère un nouveau
    #   (uuid4() = identifiant aléatoire quasi impossible à dupliquer)
    conversation_id = request.conversation_id or str(uuid.uuid4())

    #   Ouvre une connexion à la base de données pour cette requête
    db = SessionLocal()

    try:
        #   1. On enregistre le message de l'utilisateur en base
        user_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role="user",
            content=request.message,
        )
        db.add(user_message)
        db.commit()

        #   2. On appelle Gemini avec le message de l'utilisateur
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=request.message,
        )
        reply_text = response.text

        #   3. On enregistre la réponse de l'assistant en base
        assistant_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role="assistant",
            content=reply_text,
        )
        db.add(assistant_message)
        db.commit()

    except Exception as e:
        #   Si Gemini échoue (clé invalide, quota dépassé, etc.),
        #   on renvoie une erreur HTTP claire au frontend au lieu de planter silencieusement
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        #   On ferme la connexion à la base, que tout se soit bien passé ou non
        db.close()

    #   4. On renvoie la réponse au frontend, dans le format que ChatWindow.jsx attend
    return {
        "reply": reply_text,
        "conversationId": conversation_id,
    }