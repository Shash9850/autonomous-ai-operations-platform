# Autonomous Multi-Agent AI Operations Platform

An enterprise-style autonomous AI platform built using LangGraph, FastAPI, React, and RAG architecture.

The system supports:
- multi-agent orchestration,
- conversational RAG,
- document intelligence,
- real-time web research,
- API execution,
- contextual memory,
- and intelligent workflow automation.



## Features

- Multi-Agent AI Architecture
- LangGraph Workflow Orchestration
- Conversational RAG Pipeline
- PDF Upload & Document Intelligence
- Persistent FAISS Vector Database
- Real-Time Streaming Responses
- Context-Aware Memory
- Real Web Search Integration
- REST API Execution Agent
- React + Tailwind Frontend
- FastAPI Backend
- Modular Tool Execution Framework


## Architecture

User
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
LangGraph Multi-Agent System
  ├── Supervisor Agent
  ├── Planner Agent
  ├── Executor Agent
  ├── RAG Agent
  ├── Memory Agent
  └── API Agent
        ↓
Tools Layer
  ├── Web Search
  ├── REST APIs
  ├── Vector Search
  ├── Memory Store
  └── Calculator Tool
        ↓
FAISS Vector Database



## Tech Stack

### Backend
- Python
- FastAPI
- LangChain
- LangGraph
- FAISS
- HuggingFace Embeddings

### Frontend
- React.js
- Tailwind CSS
- Axios

### AI/ML
- RAG (Retrieval-Augmented Generation)
- Conversational Memory
- Multi-Agent AI Systems

### Infrastructure
- AWS EC2 (Planned)
- Docker (Planned)




## Current Capabilities

Users can:

- Upload PDF documents
- Ask questions about uploaded documents
- Perform conversational follow-up queries
- Execute real web research
- Trigger REST API workflows
- Receive synthesized AI-generated responses
- Interact with a multi-agent orchestration system



## Example Workflows

### Document Intelligence
Upload a resume PDF and ask:
- "What are my strongest AI skills?"
- "Summarize my projects"

### Research Automation
Ask:
- "Research latest AI startup trends"

### API Execution
Ask:
- "Use API to fetch sample todo data"




## Installation

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload




cd frontend
npm install
npm start



---

# 10. Environment Variables

```md id="readme10"
## Environment Variables

Create a `.env` file inside backend:

```env
GROQ_API_KEY=your_key
OPENAI_API_KEY=your_key
LANGCHAIN_API_KEY=your_key



---

# 11. Future Roadmap

```md id="readme11"
## Future Enhancements

- CSV/XLSX Analytics Agent
- AI Report Generation
- Email Automation Agent
- PostgreSQL AI Database Agent
- Dockerization
- AWS Deployment
- Redis Session Memory
- Multi-User Authentication
- Role-Based Access Control



## Project Vision

The goal of this project is to build a production-grade autonomous AI operations platform capable of orchestrating intelligent workflows across documents, APIs, databases, analytics systems, and enterprise tools.