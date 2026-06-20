# 🦕 FossilNet AI

> *Advanced Paleontological Intelligence Core — where deep time meets deep learning.*

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-REST_Framework-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Transformers-FFD21F?style=for-the-badge&logo=huggingface&logoColor=black)
![Ollama](https://img.shields.io/badge/Ollama-Mistral_7B-000000?style=for-the-badge&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📋 Table of Contents

**Product Case Study**
1. [The Problem](#1-the-problem)
2. [Why It Matters](#2-why-it-matters)
3. [The Solution](#3-the-solution)
4. [How It Works](#4-how-it-works)
5. [Tech Stack](#5-tech-stack)
6. [Key Features](#6-key-features)
7. [Results & Impact](#7-results--impact)
8. [Future Roadmap](#8-future-roadmap)

**Technical Documentation**
- [System Architecture & Data Flow](#️-system-architecture--data-flow)
- [Project Directory Structure](#-project-directory-structure)
- [Deep Learning & NLP Models](#-deep-learning--nlp-models-in-depth-specs)
- [API Endpoints Specification](#-api-endpoints-specification)
- [Frontend Dashboard Views](#️-frontend-dashboard-views)
- [System Setup & Verification Guide](#️-system-setup--verification-guide)

---

## 🎯 Product Case Study

### 1. The Problem

Paleontological knowledge is locked away in academic journals, dense scientific databases, and static museum exhibits. Students, researchers, and enthusiasts have no unified, interactive way to explore fossil records, identify specimens, or access geological history without a PhD-level background.

---

### 2. Why It Matters

Understanding geological time is foundational to:
- **Climate Science** — reading Earth's climate history from the rock record.
- **Evolutionary Biology** — tracing the origin of species across deep time.
- **Archaeological Research** — contextualising human history within geological epochs.
- **STEM Education** — sparking early curiosity in Earth sciences.

Yet fewer than 10% of existing tools make this data accessible without specialist training. The gap between expert knowledge and public access is widening — FossilNet closes it.

---

### 3. The Solution

FossilNet is a full-stack AI web platform that turns complex paleontological data into an interactive, conversational experience. It lets anyone:

- **Upload a photo** of a fossil and get an instant AI-powered classification.
- **Ask questions** in plain English and receive expert-level answers from a local LLM.
- **Explore geological eras** on an interactive timeline with rich descriptions.
- **Map excavation sites** on a real-time interactive world map.
- **Mine academic papers** for locations, researchers, and key fossil discoveries.

No prior expertise required.

---

### 4. How It Works

```
User Uploads Image ──► CLIP Vision Model ──► Fossil Classification + Confidence Score
User Types Question ──► Mistral 7B LLM   ──► Scientific Markdown Response
User Speaks Query   ──► Whisper STT      ──► Text ──► LLM ──► SpeechT5 TTS ──► Audio Reply
User Reads Paper    ──► BERT NER         ──► Named Entities (locations, people, orgs)
User Views Map      ──► Django API       ──► Geo-coordinates of top dig sites
```

The React/Vite frontend communicates with a Django REST backend via Axios. The backend runs five local AI pipelines — no external API keys needed for inference.

---

### 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Framer Motion, React Leaflet, React Markdown |
| **Styling** | Custom CSS glassmorphism tokens, Lucide React icons |
| **Backend** | Django 4, Django REST Framework |
| **Computer Vision** | OpenAI CLIP (`clip-vit-base-patch32`) via Hugging Face |
| **NLP / NER** | BERT (`dslim/bert-base-NER`) via Hugging Face |
| **Speech-to-Text** | OpenAI Whisper Base via Hugging Face + Librosa |
| **Text-to-Speech** | Microsoft SpeechT5 TTS + CMU Arctic Speaker Vectors |
| **Local LLM** | Mistral 7B via Ollama (runs 100% offline) |
| **Database** | SQLite (dev) |
| **Audio** | FFmpeg, SoundFile, NumPy waveform processing |

---

### 6. Key Features

| Feature | Description |
|---------|-------------|
| 🦴 **Shazam for Fossils** | Zero-shot image classification with CLIP — upload a photo, get a fossil ID with confidence scores |
| 🤖 **AI Assistant** | Voice-in, voice-out LLM chat powered by Mistral 7B running locally |
| 📚 **Literature Miner** | Paste any academic text; BERT NER extracts and highlights people, places, and organisations |
| 🗺️ **Prospector Map** | Interactive Leaflet map of top fossil excavation sites worldwide |
| ⏳ **Time Machine** | Explore all 6 geological eras with climate data and key species |
| 🔊 **Voice I/O** | Speak questions via Whisper STT; hear answers via SpeechT5 TTS |
| 🌐 **100% Local AI** | All models run on-device — no OpenAI API keys or cloud costs |
| 🎨 **Premium UI** | Glassmorphic dark-mode dashboard with smooth micro-animations |

---

### 7. Results & Impact

- **5 AI models** integrated into a single coherent research platform.
- **Zero external API costs** — all inference runs locally via Hugging Face + Ollama.
- **End-to-end voice pipeline** built from scratch: browser mic → Whisper → LLM → SpeechT5 → HTML5 Audio.
- **Overcame key engineering challenges:**
  - Resolved browser `.webm` audio incompatibility with Whisper using Librosa resampling.
  - Solved SpeechT5 token-length limits by chunking text into 400-character segments before synthesis.
  - Built a confidence-threshold heuristic to flag non-fossil images automatically.
  - Removed artificial UI delays across all pages for instant responsiveness.

**Who benefits:**
- 🎓 **Students** — Interactive visual learning of Earth sciences.
- 🔬 **Researchers** — Rapid fossil identification and literature analysis.
- 🏛️ **Educators** — Ready-to-use classroom tool for geology and evolution topics.
- 🌍 **Public** — Anyone curious about prehistory, accessible with zero expertise.

---

### 8. Future Roadmap

- [ ] **User Collections** — Let users save favourite fossils and build personal databases.
- [ ] **Multilingual Support** — Translate UI and AI responses into 10+ languages.
- [ ] **Mobile App** — React Native version with offline caching for field researchers.
- [ ] **AR Visualisations** — View 3D fossil reconstructions in augmented reality.
- [ ] **Crowdsourced Discoveries** — Let users submit and verify new fossil site coordinates.
- [ ] **Fine-tuned Fossil LLM** — Replace Mistral 7B with a domain-specific model trained on paleontology literature.
- [ ] **Real Database** — Migrate from mock data to a curated PostgreSQL fossil record database.

---

---

## 🏗️ System Architecture & Data Flow

FossilNet operates under a decoupled Client-Server architecture:
1. **Frontend** — React (Vite) SPA with glassmorphic design tokens, Framer Motion animations, interactive maps, and full audio capabilities.
2. **Backend** — Django REST Framework serving local ML pipelines, coordinating model caching, and managing geospatial and temporal records.
3. **Local AI Hub** — PyTorch/Hugging Face pipelines and a local Ollama server running Mistral 7B.

### 🔄 Data Exchange Pipeline
```
[React Frontend] (Port 5173)
       │
       │ HTTP Requests (Axios JSON / Multipart-Form)
       ▼
[Django REST Backend] (Port 8000)
       │
       ├─► [Hugging Face Pipelines] (CLIP, BERT NER, Whisper, SpeechT5)
       │
       └─► [Local Ollama Service] (Mistral 7B on port 11434)
```

---

## 📂 Project Directory Structure

```
FossilNet/
├── backend/                       # Django REST API Backend
│   ├── fossilnet_backend/         # Core Django settings, URLs, and static media configuration
│   ├── fossil_api/                # API Application (Views, Services, URLs, Models)
│   │   ├── services.py            # LocalAIService class: loads/runs pipeline models
│   │   ├── views.py               # REST endpoints utilizing AI pipelines & geological data
│   │   ├── urls.py                # API paths mapping views to endpoints
│   │   └── root_view.py           # Landing API operational response view
│   ├── media/                     # Generated audio responses (SpeechT5 .wav files)
│   ├── db.sqlite3                 # Local SQLite database
│   ├── download_models.py         # HuggingFace pipeline pre-download script
│   ├── verify_ai.py               # Model test script (runs test inputs for all active AI models)
│   └── requirements.txt           # Python backend dependencies
└── fossilnet_frontend/            # Vite + React Frontend Dashboard
    ├── public/                    # Public static files
    ├── src/
    │   ├── assets/                # Icons, local images, and styles
    │   ├── pages/
    │   │   ├── Landing.jsx        # Landing page with glassmorphic feature cards
    │   │   ├── Shazam.jsx         # Specimen classifier (image upload / URL input)
    │   │   ├── Literature.jsx     # Text mining engine for academic papers
    │   │   ├── Prospector.jsx     # Excavation zones visualiser (React Leaflet maps)
    │   │   ├── Timeline.jsx       # Time Machine showing all geological eras
    │   │   └── Assistant.jsx      # Voice-capable LLM chatbot (Whisper & SpeechT5)
    │   ├── App.jsx                # Layout, routes, global navbar
    │   ├── index.css              # Design tokens, animations, glassmorphic layout
    │   └── main.jsx               # React entry point
    └── package.json               # Frontend dependencies
```

---

## 🤖 Deep Learning & NLP Models (In-Depth Specs)

FossilNet hosts five distinct AI models. Below are their specifications, roles, and implementation heuristics:

### 1. Specimen Classifier (Computer Vision)
* **Model ID**: `openai/clip-vit-base-patch32`
* **Task**: `zero-shot-image-classification`
* **Role**: The "Shazam for Fossils." Analyses uploaded images or URLs and predicts labels from a curated candidate set.
* **Candidate Labels**:
  * *Fossil Classes*: `Trilobite Fossil`, `Ammonite Fossil`, `Dinosaur Bone`, `Fern Fossil`, `Shark Tooth`, `Ancient Shell`, `Coprolite`, `Stromatolite`, `Crinoid Fossil`
  * *Negative Controls*: `Modern Car or Vehicle`, `Common Rock or Stone`, `Non-fossil Object`, `Modern Animal`, `Furniture or Room`
* **Heuristics**: If the top-scoring label matches a negative control term or confidence is below **25%**, the API flags the result so the frontend shows a yellow cautionary banner.

### 2. Literature Mining Engine (NLP NER)
* **Model ID**: `dslim/bert-base-NER`
* **Task**: `ner` (Named Entity Recognition)
* **Role**: Parses academic publications and extracts named entities — Persons, Organisations, Locations, and Miscellaneous — mapping fossil descriptions to geographic discovery sites or named researchers.
* **Output Mapping**: Returns words alongside character offsets (`start`, `end`), confidence `score`, and entity tags (`LOC`, `PER`, `ORG`, `MISC`), which the frontend colour-codes dynamically.

### 3. Speech-to-Text (STT)
* **Model ID**: `openai/whisper-base`
* **Task**: `automatic-speech-recognition`
* **Role**: Converts researcher voice queries into plain-text prompts.
* **Engineering Detail**: Browser `.webm` audio is resampled to 16kHz via `librosa.load(..., sr=16000)` before passing to Whisper — solving the format incompatibility between browser `MediaRecorder` output and the model's expected input.

### 4. Text-to-Speech (TTS)
* **Model ID**: `microsoft/speecht5_tts`
* **Task**: `text-to-speech`
* **Role**: Synthesises the AI assistant's text answers as vocal audio replies.
* **Audio Engineering Details**:
  * *Speaker Signature*: Uses CMU Arctic speaker vector ID `7306` (`Matthijs/cmu-arctic-xvectors`) for a natural-sounding voice. Falls back to a 512-dim zero-vector if unavailable.
  * *Chunking Heuristic*: Text is split into **400-character** chunks, each synthesised individually, then concatenated and peak-normalised to prevent audio clipping.
  * *Cache Prevention*: Response URL includes a timestamp (`?t=1700000000`) to force fresh playback via the HTML5 Audio API.

### 5. Intellectual Assistant (Local LLM)
* **Model**: Mistral 7B via Ollama (runs 100% offline)
* **Role**: An authoritative conversational partner specialising in geological periods, index fossils, and stratigraphy.
* **System Prompt**:
  ```text
  You are the FossilNet AI, a world-class paleontological research assistant.
  Provide highly specific, scientific, and accurate information about fossils,
  geological time periods, and evolutionary history.
  CRITICAL: Always use Markdown formatting with double newlines between paragraphs,
  bulleted lists for multiple points, and bold headers for sections.
  Do not group points into a single line; ensure each point starts on a new line.
  ```

---

## 📡 API Endpoints Specification

All endpoints are hosted at `http://localhost:8000/api/`.

### `POST /api/identify/`
Classifies an uploaded image or image URL as a fossil specimen.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `image` | File | Optional | Image file from client |
| `image_url` | String | Optional | Publicly accessible image URL |

```json
{
  "identifications": [
    { "label": "Trilobite Fossil", "score": 0.892 },
    { "label": "Common Rock or Stone", "score": 0.054 }
  ],
  "is_fossil_likely": true,
  "warning": null,
  "uncertainty": null
}
```

---

### `POST /api/mining/`
Extracts named entities from academic or research text.

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | String | Document or text snippet to parse |

```json
[
  { "entity": "B-LOC", "score": 0.998, "word": "Burgess", "start": 48, "end": 55 }
]
```

---

### `POST /api/assistant/`
Sends a chat prompt to the local Mistral 7B LLM.

| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | String | User's question or message |

```json
{ "generated_text": "**Trilobites** were marine arthropods that..." }
```

---

### `GET /api/prospector/`
Returns a list of high-probability fossil excavation sites with coordinates.

```json
[
  { "id": 1, "name": "Hell Creek Formation", "lat": 47.1, "lng": -106.3, "score": 95, "fossils": ["T-Rex", "Triceratops"] }
]
```

---

### `GET /api/timeline/`
Returns all six geological eras with descriptions and date ranges.

```json
[
  { "name": "Cambrian", "start": 541, "end": 485, "description": "Explosion of complex life forms." }
]
```

---

### `POST /api/transcribe/`
Converts a recorded voice file into text using Whisper.

| Parameter | Type | Description |
|-----------|------|-------------|
| `audio` | File | WebM/WAV audio file from browser microphone |

```json
{ "text": "what is a trilobite" }
```

---

### `POST /api/synthesize/`
Converts a text string into a voice audio file using SpeechT5 TTS.

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | String | Text response to synthesise |

```json
{ "audio_url": "/media/response_speech.wav?t=1716912345" }
```

---

## 🖥️ Frontend Dashboard Views

The frontend uses a custom glassmorphism design system (`index.css`) with Lucide React icons and Framer Motion animations.

| Route | Page | Description |
|-------|------|-------------|
| `/` | **Landing Dashboard** | Central hub showcasing all features via hover-responsive glassmorphic cards |
| `/shazam` | **Shazam for Fossils** | Drag-and-drop or URL image classifier with score charts and prediction thresholds |
| `/literature` | **Literature Mining** | Paste academic text; extracted entities appear as colour-coded NER badges |
| `/prospector` | **Prospector AI** | Dark-mode Leaflet map with predicted dig-site coordinates and a ranked sidebar |
| `/timeline` | **Time Machine** | Interactive geological era timeline with climate profiles and key species |
| `/assistant` | **AI Assistant** | Voice-capable chatbot: hold mic to speak, click avatar to hear the reply |

---

## ⚙️ System Setup & Verification Guide

### 📋 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.10+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| Ollama | Latest | Local LLM server |
| FFmpeg | Any | Audio processing for Whisper & Librosa |

**Install Ollama and pull Mistral:**
```bash
ollama run mistral:7b
```

**Install FFmpeg on Windows:**
```powershell
winget install FFmpeg
```

---

### 🐍 Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Pre-download and cache all Hugging Face models
python download_models.py

# Verify all AI pipelines are working
python verify_ai.py

# Start Django development server
python manage.py runserver
```

> ✅ `verify_ai.py` will print `[SUCCESS]` for each of the five AI pipelines when everything is configured correctly.

---

### ⚛️ Frontend Setup
```bash
cd fossilnet_frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Open **http://localhost:5173** to access the FossilNet dashboard.

---

*Built with React · Vite · Django · Hugging Face Transformers · Ollama · Mistral 7B*
