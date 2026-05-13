from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from fastapi import UploadFile, File
import shutil

from app.rag.ingest import ingest_document

import asyncio
import json

from app.api.schemas import TaskRequest
from app.api.schemas import TaskResponse

from app.agents.workflow import build_workflow

from app.analytics.session_store import LATEST_DATASET
import app.analytics.session_store as session_store

router = APIRouter()

workflow = build_workflow()


@router.post("/run-task", response_model=TaskResponse)
async def run_task(request: TaskRequest):

    result = workflow.invoke({
        "task": request.task,
        "route": "",
        "plan": [],
        "current_step": 0,
        "results": [],
        "final_response": "",
        "chat_history": []
    })

    return result


async def stream_workflow(
    task: str,
    recipient_email: str = None,
    chat_history: list = []
):

    yield f"data: Starting task: {task}\n\n"

    await asyncio.sleep(1)

    yield "data: Supervisor routing...\n\n"

    await asyncio.sleep(1)

    yield "data: Planner generating execution plan...\n\n"

    await asyncio.sleep(1)

    yield "data: Executor calling tools...\n\n"

    await asyncio.sleep(1)

    result = workflow.invoke({
        "task": task,
        "route": "",
        "plan": [],
        "current_step": 0,
        "results": [],
        "final_response": "",
        "recipient_email": recipient_email,
        "chat_history": chat_history
    })

    yield f"data: {json.dumps(result)}\n\n"

    yield "data: TASK_COMPLETE\n\n"


@router.post("/stream-task")
async def stream_task(request: TaskRequest):

    return StreamingResponse(
        stream_workflow(request.task,request.recipient_email,request.chat_history),
        media_type="text/event-stream"
    )





@router.post("/upload-document")

async def upload_document(file: UploadFile = File(...)):

    file_path = f"storage/docs/{file.filename}"

    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(file.file, buffer)

    # PDF → RAG ingestion
    if file.filename.endswith(".pdf"):

        result = ingest_document(file_path)

    # CSV/XLSX → analytics storage only
    elif file.filename.endswith((".csv", ".xlsx")):

        session_store.LATEST_DATASET = file_path

        result = "Dataset uploaded successfully"

    else:

        return {
            "error": "Unsupported file type"
        }

    return {
        "message": result,
        "filename": file.filename,
        "file_path": file_path
    }