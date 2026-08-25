# Vera — AI Resume Assistant

Vera is an interactive AI-powered resume portfolio that lets recruiters and visitors explore Vaishali Sonkar's professional background through natural-language questions. Instead of reading a static resume from top to bottom, visitors can ask about skills, projects, experience, technologies, and achievements and receive concise answers grounded in the resume.

The application combines a responsive React interface with a FastAPI backend and a retrieval-augmented generation (RAG) pipeline. Resume content is stored in a local FAISS vector index, relevant sections are retrieved for each question, and Google's Gemini models generate a streamed response using only that context.

## Highlights

- Conversational resume assistant with suggested recruiter questions
- Answers grounded in retrieved resume content to reduce hallucinations
- Token-by-token response streaming for a responsive chat experience
- Dedicated certificates, projects, suggestions, and contact views
- Downloadable resume and links to LinkedIn and GitHub
- Contact form backed by SMTP email delivery
- Feedback collection through Google Sheets
- Responsive portfolio layout for desktop and smaller screens
- Automatic interactive API documentation through FastAPI

## How it works

```text
Visitor question
      │
      ▼
React interface ── POST /chat/stream ──► FastAPI
                                             │
                                             ▼
                                  Gemini text embedding
                                             │
                                             ▼
                                  FAISS similarity search
                                             │
                                             ▼
                                  Relevant resume sections
                                             │
                                             ▼
                                   Gemini grounded answer
                                             │
                                             ▼
                                  Streamed back to the UI
```

The assistant's system prompt requires it to answer only from information explicitly present in the retrieved resume context. When the requested information is unavailable, it responds that it cannot find it in the resume.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, React Markdown, Remark GFM |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| AI | Google Gemini (`gemini-3.6-flash`, `gemini-embedding-001`) |
| Retrieval | FAISS, NumPy, pickle |
| Resume processing | PyMuPDF |
| Feedback | Google Sheets, gspread, Google service accounts |
| Contact | SMTP with TLS/SSL |

## Project structure

```text
ai_resume_assistant/
├── backend/
│   ├── main.py              # FastAPI application and routes
│   ├── chatbot.py           # Gemini prompt and answer generation
│   ├── embedder.py          # Gemini embedding generation
│   ├── vector_store.py      # FAISS storage and similarity search
│   ├── resume_parser.py     # PDF text extraction
│   ├── chunker.py           # Resume text chunking
│   ├── build_index.py       # Vector-index generation script
│   ├── email_service.py     # Contact-form email delivery
│   ├── sheets_service.py    # Google Sheets feedback storage
│   └── schemas.py           # Request validation models
├── data/                    # Source resume PDF
├── index/                   # Prebuilt FAISS index and text chunks
├── frontend/
│   ├── public/assets/       # Resume and profile assets
│   ├── src/main.jsx         # React application
│   ├── src/styles.css       # Application styling
│   └── package.json
├── .env.example             # Environment-variable template
├── .gitignore
└── requirements.txt
```

## Getting started

### Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer and npm
- A Google AI API key
- Optional: a Google service-account key for feedback collection
- Optional: SMTP credentials for the contact form

### 1. Clone the repository

```bash
git clone https://github.com/Vaishali-Sonkar/Vera_Ai_Assistant.git
cd Vera_Ai_Assistant
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in the project root, then replace the placeholders with your own values.

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

The application currently uses these settings:

| Variable | Required | Purpose |
| --- | --- | --- |
| `GOOGLE_API_KEY` | Yes | Generates resume embeddings and chat answers |
| `SMTP_HOST` | For contact form | SMTP server hostname, such as `smtp.gmail.com` |
| `SMTP_PORT` | For contact form | SMTP port, usually `587` for STARTTLS or `465` for SSL |
| `SMTP_USERNAME` | For contact form | SMTP account username |
| `SMTP_PASSWORD` | For contact form | SMTP password or provider app password |
| `CONTACT_EMAIL` | For contact form | Address that receives portfolio messages |

`GROQ_API_KEY`, `QDRANT_URL`, and `QDRANT_API_KEY` are present in the example configuration for potential or earlier integrations but are not used by the current runtime.

Never commit `.env` or `credentials.json`. Both are excluded through `.gitignore`.

### 3. Set up the backend

Create and activate a virtual environment, then install the Python packages:

```bash
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

macOS or Linux:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

Start FastAPI from the `backend` directory. Running it from this directory is important because the prebuilt vector index is loaded through relative paths.

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API is available at `http://127.0.0.1:8000`, with interactive documentation at `http://127.0.0.1:8000/docs`.

### 4. Set up the frontend

Open another terminal from the project root:

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173` in a browser. The frontend automatically sends API requests to port `8000` on the same hostname.

## Optional integrations

### Google Sheets feedback

The suggestions form writes responses to a spreadsheet named **AI Resume Feedback**.

1. Create a Google Cloud service account and enable the Google Sheets and Google Drive APIs.
2. Download its JSON key as `credentials.json` into the project root.
3. Create a spreadsheet named `AI Resume Feedback`.
4. Share that spreadsheet with the service account's email address and grant editor access.

Without this configuration, the main resume chat still works, but feedback submission will fail.

### Contact email

Configure the SMTP variables in `.env` to enable the contact form. For Gmail, use an app password rather than the normal Google account password. Port `587` uses STARTTLS; port `465` uses SMTP over SSL.

Without complete SMTP settings, the API returns a `503` response for contact submissions while the rest of the application remains available.

## API reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Backend health message |
| `POST` | `/chat` | Returns a complete resume-grounded answer |
| `POST` | `/chat/stream` | Streams a resume-grounded answer as plain text |
| `POST` | `/feedback` | Saves visitor feedback to Google Sheets |
| `POST` | `/contact` | Sends a contact message through SMTP |

Example chat request:

```bash
curl -X POST http://127.0.0.1:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What technologies do you use?"}'
```

## Rebuilding the resume index

The repository includes a prebuilt FAISS index under `index/`, so rebuilding is not necessary for normal startup. If the resume PDF changes, update the PDF path in `backend/build_index.py`, activate the virtual environment, and run the script from the backend directory:

```bash
cd backend
python build_index.py
```

This extracts the PDF text, splits it into chunks, creates Gemini embeddings, and replaces `index/resume.index` and `index/chunks.pkl`. The script then enters an interactive question loop; type `exit` to finish.

## Security notes

- Keep API keys, SMTP passwords, and service-account credentials out of source control.
- Use provider-specific app passwords for SMTP accounts whenever available.
- Restrict Google service-account permissions to only the resources the app needs.
- The development CORS configuration accepts the local frontend on port `5173`; configure explicit production origins before deployment.

## Author

**Vaishali Sonkar**

- [GitHub](https://github.com/Vaishali-Sonkar)
- [LinkedIn](https://www.linkedin.com/in/vaishali-sonkar-b83a87314/)

## License

No license has been specified yet. Add a `LICENSE` file before allowing reuse or redistribution of the project.
