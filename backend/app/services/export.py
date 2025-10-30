"""
Export service for generating PDF and Markdown exports of notes.
"""
import os
import re
import tempfile
import zipfile
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Optional

import markdown
from markdown.extensions.codehilite import CodeHiliteExtension
from markdown.extensions.fenced_code import FencedCodeExtension
from markdown.extensions.nl2br import Nl2BrExtension
from markdown.extensions.tables import TableExtension
from markdown.extensions.toc import TocExtension
from weasyprint import HTML

from app.models import Note

# FontConfiguration no longer needed with simplified write_pdf usage


class ExportService:
    """Service for exporting notes to various formats."""

    @staticmethod
    def _sanitize_filename(filename: str) -> str:
        """Sanitize filename to remove invalid characters."""
        # Remove or replace invalid filename characters
        filename = re.sub(r'[<>:"/\\|?*]', "-", filename)
        # Remove control characters
        filename = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", filename)
        # Limit length
        if len(filename) > 200:
            filename = filename[:200]
        return filename.strip()

    @staticmethod
    def _get_note_content(note: Note) -> str:
        """Get the content of a note as markdown string."""
        if note.note_type.value == "text":
            return note.content_text or ""
        else:
            # For structured notes, convert to markdown
            content = note.content_structured or {}
            parts: list[str] = []

            # Helper to render arbitrary values to markdown
            def render_value(val, heading_prefix: str = "###") -> str:
                if val is None:
                    return ""
                if isinstance(val, str):
                    return val
                if isinstance(val, (int, float, bool)):
                    return str(val)
                if isinstance(val, list):
                    # Render list as bullets; if items are dicts, JSON fallback
                    rendered_items = []
                    for item in val:
                        if isinstance(item, (str, int, float, bool)):
                            rendered_items.append(f"- {item}")
                        elif isinstance(item, dict):
                            # Try common shape {title, content}
                            title = (
                                item.get("title")
                                if isinstance(item.get("title"), str)
                                else None
                            )
                            content_text = item.get("content")
                            if title:
                                rendered_items.append(
                                    f"{heading_prefix} {title}\n\n{render_value(content_text, heading_prefix + '#')}\n"
                                )
                            else:
                                # Fallback to JSON code block
                                import json

                                rendered_items.append(
                                    f"- \n\n```json\n{json.dumps(item, indent=2, ensure_ascii=False)}\n```"
                                )
                        else:
                            # Fallback to code block for unknown types
                            import json

                            try:
                                rendered_items.append(
                                    f"- \n\n```json\n{json.dumps(item, indent=2, ensure_ascii=False)}\n```"
                                )
                            except Exception:
                                rendered_items.append(f"- {str(item)}")
                    return "\n".join(rendered_items)
                if isinstance(val, dict):
                    # Render nested dict as sub-sections
                    lines = []
                    for k, v in val.items():
                        if not isinstance(k, str):
                            continue
                        lines.append(f"{heading_prefix} {k}")
                        rv = render_value(v, heading_prefix + "#")
                        if rv:
                            lines.append("")
                            lines.append(rv)
                            lines.append("")
                    return "\n".join(lines).strip()
                # Fallback
                return str(val)

            # 1) Support original shape: { summary?: str, sections?: [{title, content}] }
            if isinstance(content, dict):
                summary = content.get("summary")
                if isinstance(summary, str) and summary.strip():
                    parts.append(f"**Summary:** {summary.strip()}\n")

                sections = content.get("sections")
                if isinstance(sections, list) and sections:
                    for section in sections:
                        if not isinstance(section, dict):
                            continue
                        title = section.get("title")
                        body = section.get("content")
                        if isinstance(title, str) and title.strip():
                            parts.append(f"## {title.strip()}\n")
                        if body is not None:
                            parts.append(f"{render_value(body)}\n")

                # 2) Also support key-value object shape used by the editor: { "Section": "Text", ... }
                # Exclude keys already consumed (summary, sections). Render remaining keys as H2 sections.
                remaining = {
                    k: v for k, v in content.items() if k not in {"summary", "sections"}
                }
                if remaining:
                    for key, value in remaining.items():
                        if not isinstance(key, str):
                            continue
                        parts.append(f"## {key}\n")
                        rendered = render_value(value)
                        if rendered:
                            parts.append(rendered)
                        parts.append("")

            # Finalize
            md = "\n".join(parts).strip()
            # Fallback: if nothing was rendered, dump JSON for visibility
            if not md:
                try:
                    import json

                    return f"```json\n{json.dumps(content, indent=2, ensure_ascii=False)}\n```"
                except Exception:
                    return str(content)
            return md

    @staticmethod
    def _generate_markdown_frontmatter(note: Note) -> str:
        """Generate YAML frontmatter for markdown export."""
        tags = [tag.name for tag in note.tags] if note.tags else []

        frontmatter = [
            "---",
            f"title: {note.title}",
            f"created: {note.created_at.strftime('%Y-%m-%d %H:%M:%S')}",
            f"updated: {note.updated_at.strftime('%Y-%m-%d %H:%M:%S')}",
        ]

        if tags:
            frontmatter.append(f"tags: [{', '.join(tags)}]")

        if note.folder:
            frontmatter.append(f"folder: {note.folder.name}")

        frontmatter.append(f"type: {note.note_type.value}")
        frontmatter.append("---\n")

        return "\n".join(frontmatter)

    @staticmethod
    def export_to_markdown(note: Note) -> tuple[bytes, str]:
        """
        Export a note to Markdown format with YAML frontmatter.

        Args:
            note: The Note object to export

        Returns:
            tuple: (file_bytes, filename)
        """
        # Generate frontmatter
        frontmatter = ExportService._generate_markdown_frontmatter(note)

        # Get note content
        content = ExportService._get_note_content(note)

        # Combine frontmatter and content
        markdown_content = f"{frontmatter}\n# {note.title}\n\n{content}"

        # Generate filename
        date_str = note.created_at.strftime("%Y-%m-%d")
        safe_title = ExportService._sanitize_filename(note.title)
        filename = f"{safe_title}-{date_str}.md"

        return markdown_content.encode("utf-8"), filename

    @staticmethod
    def _generate_html_for_pdf(
        note: Note, paper_size: str = "letter", orientation: str = "portrait"
    ) -> str:
        """Generate HTML content for PDF export."""
        # Get note content as markdown (supports text, original structured, and key-value structured)
        content_md = ExportService._get_note_content(note)

        # Convert markdown to HTML
        md = markdown.Markdown(
            extensions=[
                FencedCodeExtension(),
                TableExtension(),
                TocExtension(baselevel=2),
                Nl2BrExtension(),
                CodeHiliteExtension(css_class="highlight"),
            ]
        )
        content_html = md.convert(content_md)

        # Generate metadata section
        tags = [tag.name for tag in note.tags] if note.tags else []
        tags_html = ""
        if tags:
            tag_badges = "".join([f'<span class="tag">{tag}</span>' for tag in tags])
            tags_html = f'<div class="tags"><strong>Tags:</strong> {tag_badges}</div>'

        folder_html = ""
        if note.folder:
            folder_html = (
                f'<div class="folder"><strong>Folder:</strong> {note.folder.name}</div>'
            )

        # Generate full HTML
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{note.title}</title>
            <style>
                @page {{
                    size: {paper_size} {orientation};
                    margin: 2.5cm;
                    @top-center {{
                        content: "{note.title}";
                        font-size: 10pt;
                        color: #666;
                    }}
                    @bottom-right {{
                        content: "Page " counter(page) " of " counter(pages);
                        font-size: 9pt;
                        color: #666;
                    }}
                }}
                
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 11pt;
                    line-height: 1.6;
                    color: #333;
                    max-width: 100%;
                }}
                
                h1 {{
                    font-size: 24pt;
                    font-weight: bold;
                    color: #1a202c;
                    margin-top: 0;
                    margin-bottom: 0.5em;
                    border-bottom: 2px solid #4a5568;
                    padding-bottom: 0.3em;
                }}
                
                h2 {{
                    font-size: 18pt;
                    font-weight: bold;
                    color: #2d3748;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    border-bottom: 1px solid #cbd5e0;
                    padding-bottom: 0.2em;
                }}
                
                h3 {{
                    font-size: 14pt;
                    font-weight: bold;
                    color: #4a5568;
                    margin-top: 1.2em;
                    margin-bottom: 0.4em;
                }}
                
                h4, h5, h6 {{
                    font-size: 12pt;
                    font-weight: bold;
                    color: #718096;
                    margin-top: 1em;
                    margin-bottom: 0.3em;
                }}
                
                p {{
                    margin-bottom: 0.8em;
                    text-align: justify;
                }}
                
                .metadata {{
                    background-color: #f7fafc;
                    border-left: 4px solid #4299e1;
                    padding: 1em;
                    margin-bottom: 2em;
                    font-size: 10pt;
                    color: #4a5568;
                }}
                
                .metadata div {{
                    margin-bottom: 0.3em;
                }}
                
                .tags {{
                    margin-top: 0.5em;
                }}
                
                .tag {{
                    display: inline-block;
                    background-color: #edf2f7;
                    color: #2d3748;
                    padding: 0.2em 0.6em;
                    border-radius: 0.3em;
                    margin-right: 0.4em;
                    font-size: 9pt;
                    font-weight: 500;
                }}
                
                ul, ol {{
                    margin-left: 1.5em;
                    margin-bottom: 1em;
                }}
                
                li {{
                    margin-bottom: 0.3em;
                }}
                
                code {{
                    background-color: #f7fafc;
                    color: #d53f8c;
                    padding: 0.2em 0.4em;
                    border-radius: 0.2em;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 10pt;
                }}
                
                pre {{
                    background-color: #2d3748;
                    color: #e2e8f0;
                    padding: 1em;
                    border-radius: 0.3em;
                    overflow-x: auto;
                    margin-bottom: 1em;
                }}
                
                pre code {{
                    background-color: transparent;
                    color: inherit;
                    padding: 0;
                }}
                
                blockquote {{
                    border-left: 4px solid #cbd5e0;
                    padding-left: 1em;
                    margin-left: 0;
                    color: #4a5568;
                    font-style: italic;
                }}
                
                table {{
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 1em;
                    font-size: 10pt;
                }}
                
                th, td {{
                    border: 1px solid #cbd5e0;
                    padding: 0.5em;
                    text-align: left;
                }}
                
                th {{
                    background-color: #edf2f7;
                    font-weight: bold;
                    color: #2d3748;
                }}
                
                a {{
                    color: #3182ce;
                    text-decoration: none;
                }}
                
                a:hover {{
                    text-decoration: underline;
                }}
                
                img {{
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 1em 0;
                }}
                
                hr {{
                    border: none;
                    border-top: 1px solid #cbd5e0;
                    margin: 2em 0;
                }}
            </style>
        </head>
        <body>
            <h1>{note.title}</h1>
            
            <div class="metadata">
                <div><strong>Created:</strong> {note.created_at.strftime('%B %d, %Y at %H:%M')}</div>
                <div><strong>Last Updated:</strong> {note.updated_at.strftime('%B %d, %Y at %H:%M')}</div>
                <div><strong>Type:</strong> {note.note_type.value.title()}</div>
                {folder_html}
                {tags_html}
            </div>
            
            <div class="content">
                {content_html}
            </div>
        </body>
        </html>
        """

        return html

    @staticmethod
    def export_to_pdf(
        note: Note, paper_size: str = "letter", orientation: str = "portrait"
    ) -> tuple[bytes, str]:
        """
        Export a note to PDF format.

        Args:
            note: The Note object to export
            paper_size: Paper size ('letter' or 'a4')
            orientation: Page orientation ('portrait' or 'landscape')

        Returns:
            tuple: (file_bytes, filename)
        """
        # Generate HTML with paper size and orientation
        html_content = ExportService._generate_html_for_pdf(
            note, paper_size, orientation
        )

        # Generate PDF (without font_config to test)
        html = HTML(string=html_content)
        pdf_bytes = html.write_pdf()

        # Generate filename
        date_str = note.created_at.strftime("%Y-%m-%d")
        safe_title = ExportService._sanitize_filename(note.title)
        filename = f"{safe_title}-{date_str}.pdf"

        return pdf_bytes, filename

    @staticmethod
    def export_to_markdown_with_assets(note: Note) -> tuple[bytes, str]:
        """
        Export a note to Markdown format with assets in a ZIP file.
        This is for future expansion when images/attachments are supported.

        Args:
            note: The Note object to export

        Returns:
            tuple: (zip_bytes, filename)
        """
        # Create in-memory ZIP file
        zip_buffer = BytesIO()

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            # Add markdown file
            md_content, md_filename = ExportService.export_to_markdown(note)
            zip_file.writestr(md_filename, md_content)

            # TODO: When image support is added, extract images from content
            # and add them to an 'assets/' folder in the ZIP
            # Then update image links in markdown to use relative paths

        zip_buffer.seek(0)

        # Generate filename
        date_str = note.created_at.strftime("%Y-%m-%d")
        safe_title = ExportService._sanitize_filename(note.title)
        filename = f"{safe_title}-{date_str}.zip"

        return zip_buffer.read(), filename
