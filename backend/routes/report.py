import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
 
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from backend.db import get_session
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io
from datetime import datetime
 
router = APIRouter()
 
VERDICT_COLORS = {
    "APPROVED":    colors.HexColor("#10b981"),
    "CONDITIONAL": colors.HexColor("#f59e0b"),
    "REJECTED":    colors.HexColor("#ef4444"),
}
 
 
def _build_pdf(session: dict) -> bytes:
    buffer  = io.BytesIO()
    doc     = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=0.75*inch, leftMargin=0.75*inch,
        topMargin=0.75*inch,   bottomMargin=0.75*inch
    )
    styles  = getSampleStyleSheet()
    story   = []
 
    title_style = ParagraphStyle(
        "Title", parent=styles["Title"],
        fontSize=18, textColor=colors.HexColor("#1e293b"), spaceAfter=4
    )
    sub_style = ParagraphStyle(
        "Sub", parent=styles["Normal"],
        fontSize=10, textColor=colors.HexColor("#64748b"), spaceAfter=12
    )
    h2_style = ParagraphStyle(
        "H2", parent=styles["Heading2"],
        fontSize=13, textColor=colors.HexColor("#1e293b"),
        spaceBefore=14, spaceAfter=6
    )
    body_style = ParagraphStyle(
        "Body", parent=styles["Normal"],
        fontSize=10, leading=14, textColor=colors.HexColor("#334155")
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer", parent=styles["Normal"],
        fontSize=8, textColor=colors.HexColor("#94a3b8"), leading=11
    )
 
    full    = session.get("full_response", session)
    gov     = full.get("governance") or {}
    agents  = full.get("agent_results") or []
    trace   = full.get("execution_trace") or {}
    verdict = gov.get("verdict", "UNKNOWN")
    verdict_color = VERDICT_COLORS.get(verdict, colors.gray)
 
    # ── Header ─────────────────────────────────────────────
    story.append(Paragraph("Drug Repurposing Assistant", title_style))
    story.append(Paragraph("Agentic RAG — Research Hypothesis Report", sub_style))
    story.append(HRFlowable(
        width="100%", thickness=1,
        color=colors.HexColor("#e2e8f0"), spaceAfter=12
    ))
 
    # ── Query info ─────────────────────────────────────────
    story.append(Paragraph("Query Information", h2_style))
    query_data = [
        ["Query",               full.get("query", "N/A")],
        ["Normalized",          full.get("normalized_query", "N/A")],
        ["Drug (canonical)",    full.get("drug_canonical", "N/A")],
        ["Disease (canonical)", full.get("disease_canonical", "N/A")],
        ["Session ID",          session.get("session_id", "N/A")],
        ["Generated",           datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
    ]
    t = Table(query_data, colWidths=[1.8*inch, 4.7*inch])
    t.setStyle(TableStyle([
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("TEXTCOLOR",     (0,0), (0,-1), colors.HexColor("#64748b")),
        ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS",(0,0), (-1,-1),
         [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))
 
    # ── Governance decision ────────────────────────────────
    story.append(Paragraph("Governance Decision", h2_style))
 
    verdict_hex = verdict_color.hexval() if hasattr(verdict_color, 'hexval') else "333333"
    story.append(Paragraph(
        f'<font color="#{verdict_hex}" size="14"><b>{verdict}</b></font>  '
        f'Score: {round(gov.get("final_score", 0) * 100, 1)}/85  |  '
        f'Confidence: {gov.get("confidence_label", "N/A")}',
        body_style
    ))
    story.append(Spacer(1, 6))
    story.append(Paragraph(gov.get("reasoning", "No reasoning available."), body_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        f"<b>Recommendation:</b> {gov.get('recommendation', 'N/A')}",
        body_style
    ))
    story.append(Spacer(1, 12))
 
    # ── Domain scores ──────────────────────────────────────
    domain_scores = gov.get("domain_scores")
    if domain_scores:
        story.append(Paragraph("Domain-Weighted Scores", h2_style))
        score_data = [["Domain", "Weighted Score"]]
        for domain, score in domain_scores.items():
            score_data.append([
                domain.replace(" Agent", ""),
                f"{score:.4f}"
            ])
        st = Table(score_data, colWidths=[3.0*inch, 3.5*inch])
        st.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,0), colors.HexColor("#1e293b")),
            ("TEXTCOLOR",     (0,0), (-1,0), colors.white),
            ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",      (0,0), (-1,-1), 9),
            ("ROWBACKGROUNDS",(0,1), (-1,-1),
             [colors.HexColor("#f8fafc"), colors.white]),
            ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
            ("LEFTPADDING",   (0,0), (-1,-1), 8),
            ("TOPPADDING",    (0,0), (-1,-1), 5),
            ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ]))
        story.append(st)
        story.append(Spacer(1, 8))
 
        penalties = gov.get("penalties_applied") or []
        for p in penalties:
            symbol = "+" if "boost" in p.lower() else "-"
            story.append(Paragraph(f"{symbol} {p}", body_style))
 
        story.append(Paragraph(
            f"Raw score: {round(gov.get('raw_score', 0) * 100, 1)} → "
            f"Final score: {round(gov.get('final_score', 0) * 100, 1)}",
            body_style
        ))
        story.append(Spacer(1, 12))
 
    # ── Agent results ──────────────────────────────────────
    story.append(Paragraph("Agent Analysis", h2_style))
    agent_data = [["Agent", "Stage", "Supports", "Confidence", "Summary"]]
    for a in agents:
        summary_text = (a.get("summary") or "")
        if len(summary_text) > 90:
            summary_text = summary_text[:90] + "..."
        agent_data.append([
            a.get("agent_name", "").replace(" Agent", ""),
            a.get("stage", ""),
            "Yes" if a.get("supports") else "No",
            f"{round(a.get('overall_confidence', 0) * 100)}%",
            summary_text
        ])
    at = Table(agent_data, colWidths=[1.1*inch, 0.8*inch, 0.7*inch, 0.8*inch, 3.1*inch])
    at.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR",     (0,0), (-1,0), colors.white),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8),
        ("ROWBACKGROUNDS",(0,1), (-1,-1),
         [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
        ("LEFTPADDING",   (0,0), (-1,-1), 6),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ]))
    story.append(at)
    story.append(Spacer(1, 12))
 
    # ── Contradictions ─────────────────────────────────────
    contras = trace.get("contradictions") or []
    if contras:
        story.append(Paragraph("Cross-Domain Contradictions", h2_style))
        for c in contras:
            sev_color = {
                "critical": "#ef4444",
                "moderate": "#f59e0b",
                "minor":    "#94a3b8"
            }.get(c.get("severity", "minor"), "#94a3b8")
            story.append(Paragraph(
                f'<font color="{sev_color}"><b>[{c.get("severity","").upper()}]</b></font> '
                f'{c.get("domain_a","")} vs {c.get("domain_b","")}: '
                f'{c.get("description","")}',
                body_style
            ))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 8))
 
    # ── Execution trace ────────────────────────────────────
    story.append(Paragraph("Execution Trace", h2_style))
    trace_data = [
        ["Stage 1 — Safety Gate", trace.get("stage_1_safety", "N/A")],
        ["Stage 2 — Primary",     ", ".join(trace.get("stage_2_primary") or [])],
        ["Stage 3 — Secondary",   ", ".join(trace.get("stage_3_secondary") or [])],
        ["Halted At",             str(trace.get("halted_at") or "None")],
        ["Total RAG Calls",       str(trace.get("total_attempts", 0))],
    ]
    tt = Table(trace_data, colWidths=[2.0*inch, 4.5*inch])
    tt.setStyle(TableStyle([
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("FONTNAME",      (0,0), (0,-1), "Helvetica-Bold"),
        ("TEXTCOLOR",     (0,0), (0,-1), colors.HexColor("#64748b")),
        ("ROWBACKGROUNDS",(0,0), (-1,-1),
         [colors.HexColor("#f8fafc"), colors.white]),
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#e2e8f0")),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ]))
    story.append(tt)
    story.append(Spacer(1, 20))
 
    # ── Disclaimer ─────────────────────────────────────────
    story.append(HRFlowable(
        width="100%", thickness=0.5,
        color=colors.HexColor("#e2e8f0"), spaceAfter=8
    ))
    story.append(Paragraph(
        "DISCLAIMER: This report is computationally synthesized by an Agentic RAG system "
        "and is intended solely for research prioritization purposes. It does not constitute "
        "medical advice, clinical guidance, or a treatment recommendation. All hypotheses "
        "require independent experimental and clinical validation before any therapeutic "
        "consideration. Generated by Drug Repurposing Assistant v2.0 — SVCE AD22811.",
        disclaimer_style
    ))
 
    doc.build(story)
    return buffer.getvalue()
 
 
@router.get("/report/{session_id}")
async def download_report(session_id: str):
    session = await get_session(session_id)
 
    if not session:
        raise HTTPException(
            status_code=404,
            detail=(
                "Session not found. This may be a MongoDB connection issue. "
                "Check that your MONGODB_URI in .env is correct and that "
                "MongoDB Atlas Network Access allows your IP address."
            )
        )
 
    try:
        pdf_bytes = _build_pdf(session)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")
 
    query_slug = (session.get("query") or "report").replace(" ", "_").replace("'", "")[:40]
    filename   = f"drug_repurposing_{query_slug}.pdf"
 
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
