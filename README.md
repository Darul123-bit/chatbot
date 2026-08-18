# Chatbot AI — Assistant Conversationnel Collaboratif

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

Application web de chatbot propulsée par **Google Gemini API**, avec un backend **FastAPI** et un frontend **Vite + React + Tailwind CSS**. Les conversations sont persistées dans une base **PostgreSQL** hébergée sur **Neon**.

Dépôt : [github.com/Darul123-bit](https://github.com/Darul123-bit)

---

## Table des matières

- [Aperçu](#aperçu)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Lancement en local](#lancement-en-local)
- [Déploiement](#déploiement)
- [API — Endpoints principaux](#api--endpoints-principaux)
- [Tests](#tests)
- [Contribuer](#contribuer)
- [Feuille de route](#feuille-de-route)
- [Licence](#licence)

---

## Aperçu

Ce projet fournit une base réutilisable pour construire un chatbot IA prêt pour la production : gestion de l'historique des conversations, appels au modèle Gemini côté serveur (la clé API n'est jamais exposée au client), et une interface découplée du backend via une API REST documentée automatiquement par FastAPI (OpenAPI/Swagger).

Le choix d'une architecture frontend/backend séparée permet de déployer chaque partie indépendamment, de scaler le backend sans toucher au frontend, et de remplacer le moteur IA (Gemini, GPT, Claude...) sans impacter l'interface.

## Architecture

```
┌────────────────────┐      HTTPS / REST      ┌──────────────────────┐      SQL      ┌───────────────┐
│  Frontend            │ ─────────────────────▶ │  Backend               │ ────────────▶ │  PostgreSQL    │
│  React 18 + Vite      │ ◀───────────────────── │  FastAPI + Uvicorn      │ ◀──────────── │  (Neon)         │
│  Cloudflare Pages       │        JSON            │  Render                   │                └───────────────┘
└────────────────────┘                         └──────────┬───────────┘
                                                            │ appel API
                                                            ▼
                                                ┌────────────────────────┐
                                                │  Google Gemini API        │
                                                │  (Google AI Studio)         │
                                                └────────────────────────┘
```

## Stack technique

| Composant | Technologie | Rôle | Hébergement |
| :--- | :--- | :--- | :--- |
| Frontend | React 18, Vite, Tailwind CSS | Interface utilisateur, rendu et interactions | Cloudflare Pages |
| Backend | Python 3.11+, FastAPI, Uvicorn | Logique métier, appels à Gemini, exposition de l'API REST | Render |
| Base de données | PostgreSQL (Neon Serverless) | Persistance des conversations et de l'historique | Neon |
| Moteur IA | Google Gemini API (`google-genai`) | Génération des réponses conversationnelles | Google AI Studio |

## Structure du projet

```text
chatbot/
├── backend/
│   ├── main.py               # Point d'entrée FastAPI
│   ├── requirements.txt      # Dépendances Python
│   └── .env.example          # Modèle de variables d'environnement
│
├── frontend/
│   ├── src/                  # Composants et logique React
│   ├── package.json          # Dépendances Node.js
│   ├── tailwind.config.js    # Configuration Tailwind CSS
│   └── .env.example          # Modèle de variables d'environnement
│
└── README.md
```

## Prérequis

- [Python 3.11+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) et npm
- [Git](https://git-scm.com/)
- Une clé API Gemini via [Google AI Studio](https://aistudio.google.com/)
- Un projet [Neon](https://neon.tech/) pour la base PostgreSQL (offre gratuite disponible)

## Installation

**1. Cloner le dépôt**

```bash
git clone https://github.com/Darul123-bit/chatbot.git
cd chatbot
```

**2. Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

**3. Frontend**

```bash
cd ../frontend
npm install
cp .env.example .env
```

**4. Base de données**

1. Créer un projet sur [Neon](https://neon.tech/).
2. Récupérer la chaîne de connexion (`postgresql://user:password@host/dbname`).
3. La renseigner dans `DATABASE_URL` (backend/.env).
4. Appliquer les migrations (Alembic ou script SQL selon l'implémentation retenue).

## Variables d'environnement

**Backend (`backend/.env`)**

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Clé API Google Gemini |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL (Neon) |
| `CORS_ORIGINS` | Origines autorisées à appeler l'API |
| `ENV` | `development` ou `production` |

**Frontend (`frontend/.env`)**

| Variable | Description |
| :--- | :--- |
| `VITE_API_BASE_URL` | URL du backend FastAPI (ex : `http://localhost:8000`) |

Les fichiers `.env` réels ne doivent jamais être commités ; seuls les `.env.example` sont versionnés.

## Lancement en local

**Backend**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

API sur `http://localhost:8000`, documentation interactive sur `http://localhost:8000/docs`.

**Frontend**

```bash
cd frontend
npm run dev
```

Application sur `http://localhost:5173`.

## Déploiement

| Service | Plateforme | Configuration |
| :--- | :--- | :--- |
| Frontend | [Cloudflare Pages](https://pages.cloudflare.com/) | Build command : `npm run build` — dossier de sortie : `dist` |
| Backend | [Render](https://render.com/) | Web Service Python — start command : `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Base de données | [Neon](https://neon.tech/) | PostgreSQL serverless |

Les variables d'environnement de production doivent être définies directement dans les dashboards Render et Cloudflare, indépendamment du fichier `.env` local.

## API — Endpoints principaux

| Méthode | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/chat` | Envoie un message et retourne la réponse du modèle Gemini |
| `GET` | `/conversations` | Liste les conversations |
| `GET` | `/conversations/{id}` | Récupère l'historique d'une conversation |
| `DELETE` | `/conversations/{id}` | Supprime une conversation |

À ajuster selon les routes réellement implémentées dans `main.py`.

## Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

## Contribuer

1. Fork le dépôt
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committer (`git commit -m "feat: ajoute ma fonctionnalité"`)
4. Pousser la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrir une Pull Request

Convention de commit recommandée : [Conventional Commits](https://www.conventionalcommits.org/). Documenter tout nouvel endpoint dans ce README.

## Feuille de route

- Authentification utilisateur (JWT / OAuth)
- Streaming des réponses (Server-Sent Events)
- Support multi-modèles (Gemini, Claude, GPT)
- Export des conversations (PDF / Markdown)
- Mode hors-ligne / PWA

## Licence

Projet sous licence [MIT](https://opensource.org/licenses/MIT).
