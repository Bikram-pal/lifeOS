# LifeOS — Your Knowledge. Your Work. Your Intelligence.

LifeOS is an AI-powered personal operating system that bridges documents, notes, projects, tasks, goals, and knowledge into one intelligent workspace.

---

## Key Highlights

- **Context-to-Action Engine**: Automatically converts raw documents and research into actionable tasks, milestones, and project links.
- **RAG Knowledge Vault**: PDF text extraction, chunking, and grounded question answering with source citations.
- **Interactive Knowledge Graph**: React Flow canvas visualizing cross-domain relations between documents, notes, projects, and goals.
- **Kanban & Goal Tracking**: Fluid task management with drag-and-drop workflow states.
- **Groq AI Integration**: Ultra-fast LLM inference supporting configurable models (`llama-3.3-70b-versatile`).
- **Dark-First SaaS UI**: Custom design tokens, Lucide icons, Recharts velocity analytics, and responsive layout.

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, TanStack Query, Zustand, React Flow, Recharts, Lucide React, Sonner.
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT, bcrypt, Multer, Groq SDK, Zod, Helmet.

---

## Quick Start

### 1. Backend Setup
```bash
cd server
npm install
cp .env.example .env # Provide your GROQ_API_KEY
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

The client will start at `http://localhost:5173` and proxy API calls to the server at `http://localhost:5000`.
