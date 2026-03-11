"""
Cybercrime Complaint PDF Generator
====================================
Generates a professional complaint-ready PDF from portal_guide data.
Usage: python generate_complaint_pdf.py
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import Flowable
from datetime import datetime


# ── Brand Colors ──────────────────────────────────────────────────
NAVY       = colors.HexColor("#0A1628")
BLUE       = colors.HexColor("#1565C0")
LIGHT_BLUE = colors.HexColor("#E3F2FD")
RED        = colors.HexColor("#C62828")
ORANGE     = colors.HexColor("#E65100")
YELLOW_BG  = colors.HexColor("#FFF8E1")
GREEN      = colors.HexColor("#2E7D32")
GREEN_BG   = colors.HexColor("#E8F5E9")
GREY       = colors.HexColor("#607080")
LIGHT_GREY = colors.HexColor("#F5F7FA")
BORDER     = colors.HexColor("#CFD8DC")
WHITE      = colors.white

RISK_COLORS = {
    "CRITICAL": (colors.HexColor("#B71C1C"), colors.HexColor("#FFEBEE")),
    "HIGH":     (colors.HexColor("#E65100"), colors.HexColor("#FFF3E0")),
    "MEDIUM":   (colors.HexColor("#F57F17"), colors.HexColor("#FFFDE7")),
    "LOW":      (colors.HexColor("#2E7D32"), colors.HexColor("#E8F5E9")),
}


class RiskBadge(Flowable):
    """Colored risk score badge."""
    def __init__(self, score, level, width=160, height=60):
        super().__init__()
        self.score = score
        self.level = level
        self.width = width
        self.height = height

    def draw(self):
        fg, bg = RISK_COLORS.get(self.level.upper(), (GREY, LIGHT_GREY))
        c = self.canv
        c.setFillColor(bg)
        c.setStrokeColor(fg)
        c.setLineWidth(1.5)
        c.roundRect(0, 0, self.width, self.height, 8, fill=1, stroke=1)
        c.setFillColor(fg)
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(self.width / 2, self.height / 2 + 6, str(self.score))
        c.setFont("Helvetica", 9)
        c.drawCentredString(self.width / 2, self.height / 2 - 10, f"Risk Score  •  {self.level} RISK")


def build_styles():
    base = getSampleStyleSheet()
    return {
        "doc_title": ParagraphStyle("doc_title",
            fontSize=20, textColor=WHITE, fontName="Helvetica-Bold",
            alignment=TA_CENTER, spaceAfter=2),
        "doc_sub": ParagraphStyle("doc_sub",
            fontSize=10, textColor=colors.HexColor("#B0BEC5"),
            fontName="Helvetica", alignment=TA_CENTER),
        "section_header": ParagraphStyle("section_header",
            fontSize=11, textColor=WHITE, fontName="Helvetica-Bold",
            spaceAfter=0, leftIndent=6),
        "field_label": ParagraphStyle("field_label",
            fontSize=8, textColor=GREY, fontName="Helvetica-Bold",
            spaceAfter=1),
        "field_value": ParagraphStyle("field_value",
            fontSize=10, textColor=NAVY, fontName="Helvetica",
            spaceAfter=2, leading=14),
        "field_note": ParagraphStyle("field_note",
            fontSize=8, textColor=GREY, fontName="Helvetica-Oblique",
            spaceAfter=4),
        "user_fill": ParagraphStyle("user_fill",
            fontSize=9, textColor=colors.HexColor("#9E9E9E"),
            fontName="Helvetica-Oblique"),
        "body_small": ParagraphStyle("body_small",
            fontSize=8.5, textColor=GREY, fontName="Helvetica", leading=13),
        "portal_url": ParagraphStyle("portal_url",
            fontSize=10, textColor=BLUE, fontName="Helvetica-Bold",
            alignment=TA_CENTER),
        "footer": ParagraphStyle("footer",
            fontSize=7.5, textColor=GREY, fontName="Helvetica",
            alignment=TA_CENTER),
        "warn_title": ParagraphStyle("warn_title",
            fontSize=9, textColor=RED, fontName="Helvetica-Bold"),
        "warn_body": ParagraphStyle("warn_body",
            fontSize=8.5, textColor=colors.HexColor("#5D4037"),
            fontName="Helvetica", leading=13),
    }


def header_band(text, styles, color=BLUE):
    table = Table([[Paragraph(text, styles["section_header"])]], colWidths=[155*mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), color),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("ROUNDEDCORNERS", [5,5,0,0]),
    ]))
    return table


def field_row(label, value, note="", status="prefilled", styles=None):
    """Returns a 2-col table row for a single field."""
    if status == "user_fill":
        val_para = Paragraph("[ Fill in manually ]", styles["user_fill"])
        bg = colors.HexColor("#FAFAFA")
    else:
        val_para = Paragraph(str(value), styles["field_value"])
        bg = WHITE

    label_para = Paragraph(label, styles["field_label"])
    note_para  = Paragraph(note, styles["field_note"]) if note else Spacer(0, 2)

    left_cell  = [label_para, val_para, note_para]
    row_table  = Table([[left_cell]], colWidths=[145*mm])
    row_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), bg),
        ("BOX",        (0,0), (-1,-1), 0.5, BORDER),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 10),
    ]))
    return row_table


def identifiers_table(identifiers, styles):
    if not identifiers:
        return Paragraph("No suspect identifiers extracted.", styles["body_small"])

    data = [["#", "Identifier Type", "Value"]]
    for i, item in enumerate(identifiers, 1):
        data.append([str(i), item["type"], item["value"]])

    t = Table(data, colWidths=[10*mm, 52*mm, 88*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,0), NAVY),
        ("TEXTCOLOR",    (0,0), (-1,0), WHITE),
        ("FONTNAME",     (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",     (0,0), (-1,-1), 8.5),
        ("FONTNAME",     (0,1), (-1,-1), "Helvetica"),
        ("TEXTCOLOR",    (0,1), (-1,-1), NAVY),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GREY]),
        ("BOX",          (0,0), (-1,-1), 0.5, BORDER),
        ("INNERGRID",    (0,0), (-1,-1), 0.3, BORDER),
        ("TOPPADDING",   (0,0), (-1,-1), 5),
        ("BOTTOMPADDING",(0,0), (-1,-1), 5),
        ("LEFTPADDING",  (0,0), (-1,-1), 8),
        ("ALIGN",        (0,0), (0,-1), "CENTER"),
    ]))
    return t


def steps_checklist(styles):
    steps = [
        ("1", "Open Portal",      "Go to https://cybercrime.gov.in and click 'File a Complaint'"),
        ("2", "Register / Login", "Create an account or log in with your mobile OTP"),
        ("3", "Select Category",  "Choose 'Online Financial Fraud' then the sub-category shown above"),
        ("4", "Fill Section 1",   "Paste Incident Description; verify date and platform"),
        ("5", "Fill Section 2",   "Add each Suspect Identifier from the table above one by one"),
        ("6", "Fill Section 3",   "Enter your personal details as the complainant"),
        ("7", "Upload Evidence",  "Attach screenshots, transaction receipts, and chat exports"),
        ("8", "Submit",           "Review, tick the declaration checkbox, and submit"),
        ("9", "Save Ack.",        "Download the Acknowledgement Number for future reference"),
    ]
    data = [["Step", "Action", "Details"]]
    for num, action, detail in steps:
        data.append([num, action, detail])

    t = Table(data, colWidths=[12*mm, 38*mm, 105*mm])
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,0), NAVY),
        ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 8.5),
        ("FONTNAME",      (0,1), (-1,-1), "Helvetica"),
        ("TEXTCOLOR",     (0,1), (-1,-1), NAVY),
        ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, LIGHT_GREY]),
        ("BOX",           (0,0), (-1,-1), 0.5, BORDER),
        ("INNERGRID",     (0,0), (-1,-1), 0.3, BORDER),
        ("TOPPADDING",    (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING",   (0,0), (-1,-1), 8),
        ("ALIGN",         (0,0), (0,-1), "CENTER"),
        ("VALIGN",        (0,0), (-1,-1), "TOP"),
    ]))
    return t


def summary_stats_table(summary, styles):
    items = [
        ("Pre-filled Fields",    summary.get("prefilled_fields",  0), GREEN),
        ("Fields to Fill",       summary.get("user_fill_fields",  0), ORANGE),
        ("Suspect Identifiers",  summary.get("identifiers_found", 0), BLUE),
    ]
    cells = []
    for label, val, clr in items:
        inner = Table([[
            Paragraph(f'<font color="{clr.hexval()}" size="20"><b>{val}</b></font>', styles["field_value"]),
        ],[
            Paragraph(label, styles["field_label"]),
        ]], colWidths=[46*mm])
        inner.setStyle(TableStyle([
            ("ALIGN",          (0,0), (-1,-1), "CENTER"),
            ("TOPPADDING",     (0,0), (-1,-1), 8),
            ("BOTTOMPADDING",  (0,0), (-1,-1), 8),
            ("BOX",            (0,0), (-1,-1), 0.5, BORDER),
            ("BACKGROUND",     (0,0), (-1,-1), LIGHT_GREY),
        ]))
        cells.append(inner)

    t = Table([cells], colWidths=[50*mm, 50*mm, 50*mm])
    t.setStyle(TableStyle([("LEFTPADDING",(0,0),(-1,-1),2),("RIGHTPADDING",(0,0),(-1,-1),2)]))
    return t


def generate_complaint_pdf(portal_guide: dict) -> bytes:
    import io
    s1  = portal_guide.get("section1", {})
    s2  = portal_guide.get("section2", {})
    s3  = portal_guide.get("section3", {})
    smry = portal_guide.get("summary", {})

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=25*mm, rightMargin=25*mm,
        topMargin=20*mm, bottomMargin=20*mm,
        title="Cybercrime Complaint Report",
        author="CyberShield Analyser",
    )

    styles = build_styles()
    story  = []
    W      = 155 * mm  # usable width

    # ── Cover Header ─────────────────────────────────────────────
    header_data = [[
        Paragraph("CYBERCRIME COMPLAINT REPORT", styles["doc_title"]),
        Paragraph("Generated by CyberShield Analyser  •  cybercrime.gov.in", styles["doc_sub"]),
        Paragraph(f"Generated: {datetime.now().strftime('%d %b %Y, %I:%M %p')}", styles["doc_sub"]),
    ]]
    header_table = Table(header_data, colWidths=[W])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), NAVY),
        ("TOPPADDING",    (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
        ("LEFTPADDING",   (0,0), (-1,-1), 16),
        ("ROUNDEDCORNERS", [8,8,8,8]),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))

    # ── Risk Score + Summary Stats ────────────────────────────────
    risk_level = smry.get("risk_level", "HIGH").upper()
    score      = smry.get("risk_score", 0)
    fg, bg     = RISK_COLORS.get(risk_level, (GREY, LIGHT_GREY))

    risk_inner = Table([
        [Paragraph(f'<font size="24" color="{fg.hexval()}"><b>{score}</b></font>', styles["field_value"])],
        [Paragraph(f'<font color="{fg.hexval()}">⬤</font>  {risk_level} RISK', styles["warn_title"])],
        [Paragraph("Risk Score", styles["field_label"])],
    ], colWidths=[45*mm])
    risk_inner.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), bg),
        ("BOX",          (0,0), (-1,-1), 1.5, fg),
        ("ALIGN",        (0,0), (-1,-1), "CENTER"),
        ("TOPPADDING",   (0,0), (-1,-1), 10),
        ("BOTTOMPADDING",(0,0), (-1,-1), 10),
        ("ROUNDEDCORNERS", [6,6,6,6]),
    ]))

    stats_items = [
        (smry.get("prefilled_fields",  0), "Pre-filled",  GREEN,  GREEN_BG),
        (smry.get("user_fill_fields",  0), "To Fill",     ORANGE, YELLOW_BG),
        (smry.get("identifiers_found", 0), "Identifiers", BLUE,   LIGHT_BLUE),
    ]
    stat_cells = []
    for val, label, clr, bgc in stats_items:
        cell = Table([
            [Paragraph(f'<font size="20" color="{clr.hexval()}"><b>{val}</b></font>', styles["field_value"])],
            [Paragraph(label, styles["field_label"])],
        ], colWidths=[33*mm])
        cell.setStyle(TableStyle([
            ("BACKGROUND",   (0,0), (-1,-1), bgc),
            ("BOX",          (0,0), (-1,-1), 0.5, BORDER),
            ("ALIGN",        (0,0), (-1,-1), "CENTER"),
            ("TOPPADDING",   (0,0), (-1,-1), 8),
            ("BOTTOMPADDING",(0,0), (-1,-1), 8),
            ("ROUNDEDCORNERS", [6,6,6,6]),
        ]))
        stat_cells.append(cell)

    top_row = Table([[risk_inner, stat_cells[0], stat_cells[1], stat_cells[2]]],
                    colWidths=[49*mm, 36*mm, 36*mm, 36*mm])
    top_row.setStyle(TableStyle([
        ("LEFTPADDING",  (0,0), (-1,-1), 2),
        ("RIGHTPADDING", (0,0), (-1,-1), 2),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(top_row)
    story.append(Spacer(1, 12))

    # ── Important Warning ────────────────────────────────────────
    warn = Table([[
        Paragraph("⚠  IMPORTANT", styles["warn_title"]),
        Paragraph(
            "This document is a <b>pre-filled guide</b> to help you file a complaint on "
            "<b>cybercrime.gov.in</b>. It does <b>not</b> constitute an official complaint. "
            "You must visit the portal, enter your personal details, and submit the form yourself. "
            "Fields marked <i>[ Fill in manually ]</i> must be completed by you.",
            styles["warn_body"]
        ),
    ]], colWidths=[28*mm, 127*mm])
    warn.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), colors.HexColor("#FFF8E1")),
        ("BOX",          (0,0), (-1,-1), 1, ORANGE),
        ("LEFTPADDING",  (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING",   (0,0), (-1,-1), 8),
        ("BOTTOMPADDING",(0,0), (-1,-1), 8),
        ("VALIGN",       (0,0), (-1,-1), "TOP"),
    ]))
    story.append(warn)
    story.append(Spacer(1, 16))

    # ─────────────────────────────────────────────────────────────
    # SECTION 1 — Incident Details
    # ─────────────────────────────────────────────────────────────
    story.append(KeepTogether([
        header_band("  SECTION 1  —  INCIDENT DETAILS", styles, color=BLUE),
    ]))
    story.append(Spacer(1, 4))

    fields1 = s1["fields"]
    for key, field in fields1.items():
        label  = field.get("label", key)
        value  = field.get("value", "")
        note   = field.get("note", "")
        status = field.get("status", "user_fill")

        if key == "incident_description":
            # Full-width box for description
            desc_para = Paragraph(str(value), styles["field_value"]) if status == "prefilled" \
                        else Paragraph("[ Fill in manually ]", styles["user_fill"])
            note_para = Paragraph(note, styles["field_note"]) if note else Spacer(0,2)
            box = Table([[
                [Paragraph(label, styles["field_label"]), desc_para, note_para]
            ]], colWidths=[W])
            box.setStyle(TableStyle([
                ("BACKGROUND",   (0,0), (-1,-1), LIGHT_BLUE if status == "prefilled" else colors.HexColor("#FAFAFA")),
                ("BOX",          (0,0), (-1,-1), 0.5, BLUE if status == "prefilled" else BORDER),
                ("TOPPADDING",   (0,0), (-1,-1), 8),
                ("BOTTOMPADDING",(0,0), (-1,-1), 8),
                ("LEFTPADDING",  (0,0), (-1,-1), 10),
                ("RIGHTPADDING", (0,0), (-1,-1), 10),
            ]))
            story.append(box)
        else:
            story.append(field_row(label, value, note, status, styles))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────
    # SECTION 2 — Suspect Details
    # ─────────────────────────────────────────────────────────────
    story.append(KeepTogether([
        header_band("  SECTION 2  —  SUSPECT / ACCUSED DETAILS", styles, color=colors.HexColor("#6A1B9A")),
    ]))
    story.append(Spacer(1, 6))

    # Identifiers table
    story.append(Paragraph("Extracted Suspect Identifiers", styles["field_label"]))
    story.append(Spacer(1, 3))
    story.append(identifiers_table(s2.get("identifiers", []), styles))
    story.append(Spacer(1, 3))
    story.append(Paragraph(
        s2.get("note", ""), styles["field_note"]
    ))
    story.append(Spacer(1, 8))

    # Other suspect fields
    for key, field in s2["fields"].items():
        story.append(field_row(
            field.get("label", key),
            field.get("value", ""),
            field.get("note", ""),
            field.get("status", "user_fill"),
            styles
        ))
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────
    # SECTION 3 — Complainant Details
    # ─────────────────────────────────────────────────────────────
    story.append(KeepTogether([
        header_band("  SECTION 3  —  COMPLAINANT / VICTIM DETAILS", styles, color=colors.HexColor("#1B5E20")),
    ]))
    story.append(Spacer(1, 4))

    priv_note = Table([[
        Paragraph("🔒  Privacy Notice", styles["warn_title"]),
        Paragraph(
            "We do <b>not</b> store or pre-fill your personal information. "
            "All fields in this section must be entered directly on the portal.",
            styles["warn_body"]
        ),
    ]], colWidths=[30*mm, 125*mm])
    priv_note.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), GREEN_BG),
        ("BOX",          (0,0), (-1,-1), 0.5, GREEN),
        ("LEFTPADDING",  (0,0), (-1,-1), 10),
        ("RIGHTPADDING", (0,0), (-1,-1), 10),
        ("TOPPADDING",   (0,0), (-1,-1), 7),
        ("BOTTOMPADDING",(0,0), (-1,-1), 7),
        ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(priv_note)
    story.append(Spacer(1, 6))

    s3_fields = s3["fields"]
    # Render in 2-column grid
    field_list = list(s3_fields.items())
    for i in range(0, len(field_list), 2):
        row_items = field_list[i:i+2]
        cells = []
        for key, field in row_items:
            label = field.get("label", key)
            cell  = Table([[
                [Paragraph(label, styles["field_label"]),
                 Paragraph("[ Fill in manually ]", styles["user_fill"])]
            ]], colWidths=[73*mm])
            cell.setStyle(TableStyle([
                ("BACKGROUND",   (0,0), (-1,-1), colors.HexColor("#FAFAFA")),
                ("BOX",          (0,0), (-1,-1), 0.5, BORDER),
                ("TOPPADDING",   (0,0), (-1,-1), 6),
                ("BOTTOMPADDING",(0,0), (-1,-1), 6),
                ("LEFTPADDING",  (0,0), (-1,-1), 8),
            ]))
            cells.append(cell)
        if len(cells) == 1:
            cells.append(Spacer(73*mm, 1))
        row_t = Table([cells], colWidths=[76*mm, 76*mm])
        row_t.setStyle(TableStyle([
            ("LEFTPADDING",  (0,0),(-1,-1), 1),
            ("RIGHTPADDING", (0,0),(-1,-1), 1),
        ]))
        story.append(row_t)
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 16))

    # ─────────────────────────────────────────────────────────────
    # STEP-BY-STEP FILING GUIDE
    # ─────────────────────────────────────────────────────────────
    story.append(KeepTogether([
        header_band("  HOW TO FILE  —  STEP-BY-STEP CHECKLIST", styles, color=colors.HexColor("#00695C")),
    ]))
    story.append(Spacer(1, 6))
    story.append(steps_checklist(styles))
    story.append(Spacer(1, 8))

    portal_box = Table([[
        Paragraph("🌐  File your complaint at:", styles["field_label"]),
        Paragraph(smry.get("portal_url", "https://cybercrime.gov.in"), styles["portal_url"]),
        Paragraph("National Cybercrime Helpline: 1930", styles["field_label"]),
    ]], colWidths=[W])
    portal_box.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,-1), LIGHT_BLUE),
        ("BOX",          (0,0), (-1,-1), 1, BLUE),
        ("ALIGN",        (0,0), (-1,-1), "CENTER"),
        ("TOPPADDING",   (0,0), (-1,-1), 10),
        ("BOTTOMPADDING",(0,0), (-1,-1), 10),
    ]))
    story.append(portal_box)
    story.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────
    # Evidence Checklist
    # ─────────────────────────────────────────────────────────────
    story.append(KeepTogether([
        header_band("  EVIDENCE TO ATTACH WITH YOUR COMPLAINT", styles, color=NAVY),
    ]))
    story.append(Spacer(1, 6))

    evidence_items = [
        ["✓", "Screenshots of the fraudulent messages / chats"],
        ["✓", "Bank / UPI transaction receipts or statements showing the debit"],
        ["✓", "Call recordings or call logs (if phone call involved)"],
        ["✓", "Email headers or forwarded email (with full headers)"],
        ["✓", "Profile screenshots of the fraud account / website"],
        ["✓", "Any contract, offer letter, or job offer documents received"],
        ["✓", "Your National ID proof (Aadhaar / Passport) for Section 3"],
    ]
    ev_table = Table(evidence_items, colWidths=[8*mm, 147*mm])
    ev_table.setStyle(TableStyle([
        ("FONTNAME",     (0,0), (-1,-1), "Helvetica"),
        ("FONTSIZE",     (0,0), (-1,-1), 9),
        ("TEXTCOLOR",    (0,0), (0,-1), GREEN),
        ("FONTNAME",     (0,0), (0,-1), "Helvetica-Bold"),
        ("TEXTCOLOR",    (1,0), (1,-1), NAVY),
        ("TOPPADDING",   (0,0), (-1,-1), 4),
        ("BOTTOMPADDING",(0,0), (-1,-1), 4),
        ("LINEBELOW",    (0,0), (-1,-2), 0.3, BORDER),
        ("ROWBACKGROUNDS",(0,0), (-1,-1), [WHITE, LIGHT_GREY]),
    ]))
    story.append(ev_table)
    story.append(Spacer(1, 14))

    # ─────────────────────────────────────────────────────────────
    # Footer
    # ─────────────────────────────────────────────────────────────
    story.append(HRFlowable(width=W, thickness=0.5, color=BORDER))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "This report was automatically generated by CyberShield Analyser. "
        "It is intended to assist victims in filing complaints and is not a legal document. "
        "For legal advice, consult a qualified cybercrime attorney.",
        styles["footer"]
    ))
    story.append(Spacer(1, 3))
    story.append(Paragraph(
        f"Report ID: CSA-{datetime.now().strftime('%Y%m%d%H%M%S')}  •  "
        f"Generated: {datetime.now().strftime('%d %b %Y %I:%M %p')}  •  "
        "CyberShield Analyser",
        styles["footer"]
    ))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
