"""
SOP Generator — FastAPI backend
"""
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Any

import gemini_service as gs
import docx_exporter as dx

app = FastAPI(title="SOP Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──────────────────────────────────────────────────────────────────

class SOPPayload(BaseModel):
    sop: dict[str, Any]


class ChatRequest(BaseModel):
    sop: dict[str, Any]
    message: str
    history: list[dict[str, str]] = []


class NewSOPRequest(BaseModel):
    title: str = "New SOP"


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/new")
def new_sop(req: NewSOPRequest):
    """Return a blank SOP template structure."""
    return {"sop": gs.generate_blank_sop(req.title)}


@app.post("/api/upload")
async def upload_and_generate(file: UploadFile = File(...)):
    """
    Accept a PDF or DOCX file, extract its content via Gemini,
    and return a structured SOP JSON.
    """
    content = await file.read()
    filename = file.filename or ""
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    try:
        if ext == "pdf":
            raw_text = gs.extract_text_from_pdf_bytes(content, filename)
        elif ext in ("docx", "doc"):
            raw_text = gs.extract_text_from_docx_bytes(content)
        else:
            # Try treating as plain text
            try:
                raw_text = content.decode("utf-8", errors="replace")
            except Exception:
                raise HTTPException(400, "Unsupported file type. Upload a PDF or DOCX.")

        sop = gs.extract_and_generate_sop(raw_text, filename)
        return {"sop": sop, "raw_text": raw_text[:2000]}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Processing failed: {str(e)}")


@app.post("/api/chat")
def chat_refine(req: ChatRequest):
    """Refine the SOP based on a chat message."""
    try:
        updated_sop, reply = gs.chat_refine(req.sop, req.message, req.history)
        return {"sop": updated_sop, "reply": reply}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Chat refinement failed: {str(e)}")


@app.post("/api/export/docx")
def export_docx(payload: SOPPayload):
    """Convert SOP JSON to a styled DOCX file and return it."""
    try:
        docx_bytes = dx.generate_docx(payload.sop)
        title = payload.sop.get("title", "SOP").replace(" ", "_")[:50]
        filename = f"{title}.docx"
        return Response(
            content=docx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(500, f"Export failed: {str(e)}")
