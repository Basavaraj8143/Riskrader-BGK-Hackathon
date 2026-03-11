import io

with open("d:/projects/bgkhack/backend/engine/gen_com.py", "r", encoding="utf-8") as f:
    text = f.read()

original = """def generate_complaint_pdf(portal_guide: dict, output_path: str = "cybercrime_complaint.pdf"):
    s1  = portal_guide["section1"]
    s2  = portal_guide["section2"]
    s3  = portal_guide["section3"]
    smry = portal_guide["summary"]

    doc = SimpleDocTemplate(
        output_path,"""

replacement = """def generate_complaint_pdf(portal_guide: dict) -> bytes:
    import io
    s1  = portal_guide.get("section1", {})
    s2  = portal_guide.get("section2", {})
    s3  = portal_guide.get("section3", {})
    smry = portal_guide.get("summary", {})

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,"""

text = text.replace(original, replacement)

text = text.replace(
    '    doc.build(story)\n    print(f"✅  PDF saved → {output_path}")\n    return output_path',
    '    doc.build(story)\n    pdf_bytes = buffer.getvalue()\n    buffer.close()\n    return pdf_bytes'
)

idx = text.find('# ── Sample data matching your portal_guide structure ──────────────')
if idx != -1:
    text = text[:idx]

text = text.rstrip() + '\n'

with open("d:/projects/bgkhack/backend/engine/gen_com.py", "w", encoding="utf-8") as f:
    f.write(text)
