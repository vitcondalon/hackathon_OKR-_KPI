import argparse
import datetime as dt
import html
import os
import re
import zipfile

CONTENT_TYPES = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">
  <Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>
  <Default Extension=\"xml\" ContentType=\"application/xml\"/>
  <Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/>
  <Override PartName=\"/word/styles.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml\"/>
  <Override PartName=\"/docProps/core.xml\" ContentType=\"application/vnd.openxmlformats-package.core-properties+xml\"/>
  <Override PartName=\"/docProps/app.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.extended-properties+xml\"/>
</Types>
"""

RELS = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">
  <Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/>
  <Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties\" Target=\"docProps/core.xml\"/>
  <Relationship Id=\"rId3\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties\" Target=\"docProps/app.xml\"/>
</Relationships>
"""

STYLES = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<w:styles xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii=\"Times New Roman\" w:hAnsi=\"Times New Roman\"/>
        <w:lang w:val=\"vi-VN\"/>
        <w:sz w:val=\"24\"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after=\"120\"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>

  <w:style w:type=\"paragraph\" w:default=\"1\" w:styleId=\"Normal\">
    <w:name w:val=\"Normal\"/>
    <w:qFormat/>
  </w:style>

  <w:style w:type=\"paragraph\" w:styleId=\"Title\">
    <w:name w:val=\"Title\"/>
    <w:basedOn w:val=\"Normal\"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before=\"120\" w:after=\"240\"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val=\"0B1F4D\"/>
      <w:sz w:val=\"36\"/>
    </w:rPr>
  </w:style>

  <w:style w:type=\"paragraph\" w:styleId=\"Heading1\">
    <w:name w:val=\"heading 1\"/>
    <w:basedOn w:val=\"Normal\"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before=\"220\" w:after=\"120\"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val=\"143B76\"/>
      <w:sz w:val=\"30\"/>
    </w:rPr>
  </w:style>

  <w:style w:type=\"paragraph\" w:styleId=\"Heading2\">
    <w:name w:val=\"heading 2\"/>
    <w:basedOn w:val=\"Normal\"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before=\"180\" w:after=\"100\"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:color w:val=\"1E4E8C\"/>
      <w:sz w:val=\"26\"/>
    </w:rPr>
  </w:style>

  <w:style w:type=\"paragraph\" w:styleId=\"ListParagraph\">
    <w:name w:val=\"List Paragraph\"/>
    <w:basedOn w:val=\"Normal\"/>
    <w:pPr>
      <w:ind w:left=\"720\" w:hanging=\"320\"/>
      <w:spacing w:after=\"80\"/>
    </w:pPr>
  </w:style>

  <w:style w:type=\"paragraph\" w:styleId=\"Code\">
    <w:name w:val=\"Code\"/>
    <w:basedOn w:val=\"Normal\"/>
    <w:pPr>
      <w:ind w:left=\"720\"/>
      <w:spacing w:after=\"60\"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii=\"Consolas\" w:hAnsi=\"Consolas\"/>
      <w:sz w:val=\"21\"/>
    </w:rPr>
  </w:style>
</w:styles>
"""

APP = """<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<Properties xmlns=\"http://schemas.openxmlformats.org/officeDocument/2006/extended-properties\" xmlns:vt=\"http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes\">
  <Application>Codex</Application>
</Properties>
"""


def xml_escape(text: str) -> str:
    return html.escape(text, quote=False)


def normalize_markdown_inline(text: str) -> str:
    text = text.replace("`", "")
    text = text.replace("**", "")
    text = text.replace("__", "")
    text = re.sub(r"\[(.*?)\]\((.*?)\)", r"\1 (\2)", text)
    return text


def run_xml(text: str, bold: bool = False) -> str:
    safe = xml_escape(text)
    if bold:
        return f"<w:r><w:rPr><w:b/></w:rPr><w:t xml:space=\"preserve\">{safe}</w:t></w:r>"
    return f"<w:r><w:t xml:space=\"preserve\">{safe}</w:t></w:r>"


def paragraph_xml(text: str, style: str = "Normal", bold: bool = False) -> str:
    text = normalize_markdown_inline(text)
    return (
        "<w:p>"
        f"<w:pPr><w:pStyle w:val=\"{style}\"/></w:pPr>"
        f"{run_xml(text, bold=bold)}"
        "</w:p>"
    )


def markdown_to_paragraphs(md_text: str) -> str:
    parts = []
    in_code = False

    for raw in md_text.splitlines():
        line = raw.rstrip("\n")
        stripped = line.strip()

        if stripped.startswith("```"):
            in_code = not in_code
            continue

        if in_code:
            parts.append(paragraph_xml(line, style="Code"))
            continue

        if not stripped:
            parts.append("<w:p/>")
            continue

        if stripped.startswith("# "):
            parts.append(paragraph_xml(stripped[2:].strip(), style="Title", bold=True))
            continue

        if stripped.startswith("## "):
            parts.append(paragraph_xml(stripped[3:].strip(), style="Heading1", bold=True))
            continue

        if stripped.startswith("### "):
            parts.append(paragraph_xml(stripped[4:].strip(), style="Heading2", bold=True))
            continue

        if re.match(r"^[-*]\s+", stripped):
            bullet_text = re.sub(r"^[-*]\s+", "", stripped)
            parts.append(paragraph_xml(f"• {bullet_text}", style="ListParagraph"))
            continue

        if re.match(r"^\d+\.\s+", stripped):
            parts.append(paragraph_xml(stripped, style="ListParagraph"))
            continue

        if stripped.startswith("|") and stripped.endswith("|"):
            table_like = " | ".join([chunk.strip() for chunk in stripped.strip("|").split("|")])
            if re.match(r"^[-|\s]+$", stripped):
                continue
            parts.append(paragraph_xml(table_like, style="Code"))
            continue

        parts.append(paragraph_xml(line, style="Normal"))

    return "\n".join(parts)


def build_document_xml(body_xml: str) -> str:
    return f"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<w:document xmlns:wpc=\"http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas\" xmlns:mc=\"http://schemas.openxmlformats.org/markup-compatibility/2006\" xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\" xmlns:m=\"http://schemas.openxmlformats.org/officeDocument/2006/math\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:wp14=\"http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing\" xmlns:wp=\"http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing\" xmlns:w10=\"urn:schemas-microsoft-com:office:word\" xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\" xmlns:w14=\"http://schemas.microsoft.com/office/word/2010/wordml\" xmlns:wpg=\"http://schemas.microsoft.com/office/word/2010/wordprocessingGroup\" xmlns:wpi=\"http://schemas.microsoft.com/office/word/2010/wordprocessingInk\" xmlns:wne=\"http://schemas.microsoft.com/office/word/2006/wordml\" xmlns:wps=\"http://schemas.microsoft.com/office/word/2010/wordprocessingShape\" mc:Ignorable=\"w14 wp14\">
  <w:body>
    {body_xml}
    <w:sectPr>
      <w:pgSz w:w=\"11906\" w:h=\"16838\"/>
      <w:pgMar w:top=\"1200\" w:right=\"1000\" w:bottom=\"1200\" w:left=\"1000\" w:header=\"708\" w:footer=\"708\" w:gutter=\"0\"/>
    </w:sectPr>
  </w:body>
</w:document>
"""


def build_core_xml(title: str, creator: str) -> str:
    now = dt.datetime.now(dt.UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    safe_title = xml_escape(title)
    safe_creator = xml_escape(creator)
    return f"""<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>
<cp:coreProperties xmlns:cp=\"http://schemas.openxmlformats.org/package/2006/metadata/core-properties\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:dcterms=\"http://purl.org/dc/terms/\" xmlns:dcmitype=\"http://purl.org/dc/dcmitype/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">
  <dc:title>{safe_title}</dc:title>
  <dc:creator>{safe_creator}</dc:creator>
  <cp:lastModifiedBy>{safe_creator}</cp:lastModifiedBy>
  <dcterms:created xsi:type=\"dcterms:W3CDTF\">{now}</dcterms:created>
  <dcterms:modified xsi:type=\"dcterms:W3CDTF\">{now}</dcterms:modified>
</cp:coreProperties>
"""


def create_docx(markdown_path: str, output_path: str, title: str, creator: str):
    with open(markdown_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    body_xml = markdown_to_paragraphs(md_text)
    document_xml = build_document_xml(body_xml)
    core_xml = build_core_xml(title=title, creator=creator)

    with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", CONTENT_TYPES)
        zf.writestr("_rels/.rels", RELS)
        zf.writestr("word/document.xml", document_xml)
        zf.writestr("word/styles.xml", STYLES)
        zf.writestr("docProps/core.xml", core_xml)
        zf.writestr("docProps/app.xml", APP)


def parse_args():
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    default_input = os.path.join(root, "TAI_LIEU_NGHIEP_VU_HE_THONG.md")
    default_output = os.path.join(root, "TAI_LIEU_NGHIEP_VU_HE_THONG.docx")

    parser = argparse.ArgumentParser(description="Generate .docx from markdown file")
    parser.add_argument("--input", default=default_input, help="Input markdown path")
    parser.add_argument("--output", default=default_output, help="Output docx path")
    parser.add_argument("--title", default="Tai lieu nghiep vu he thong", help="Document title")
    parser.add_argument("--creator", default="Codex", help="Document creator")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    in_path = os.path.abspath(args.input)
    out_path = os.path.abspath(args.output)

    if not os.path.exists(in_path):
        raise FileNotFoundError(f"Input file not found: {in_path}")

    create_docx(markdown_path=in_path, output_path=out_path, title=args.title, creator=args.creator)
    print(out_path)
