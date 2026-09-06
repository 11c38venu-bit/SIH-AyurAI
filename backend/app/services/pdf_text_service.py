import logging
from pathlib import Path
from typing import Optional, Tuple
import pypdf

logger = logging.getLogger(__name__)

MIN_MEANINGFUL_TEXT_LENGTH = 30  # Threshold to distinguish text-based PDFs from scanned PDFs


class PDFTextService:
    """
    Direct text extractor for text-based PDF documents.
    Extracts text page-by-page preserving page traceability without invoking OCR unnecessarily.
    """

    def extract_text_from_pdf(self, file_path: str | Path) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Attempts direct selectable text extraction from a PDF file.

        Returns:
            (has_meaningful_text: bool, extracted_text: Optional[str], error_message: Optional[str])
        """
        path = Path(file_path)
        if not path.exists():
            return False, None, f"File not found: {path.name}"

        try:
            reader = pypdf.PdfReader(str(path))
            num_pages = len(reader.pages)

            if num_pages == 0:
                return False, None, "PDF has 0 pages."

            page_texts: list[str] = []
            total_clean_chars = 0

            for page_idx, page in enumerate(reader.pages, start=1):
                raw_page_text = page.extract_text() or ""
                stripped = raw_page_text.strip()
                if stripped:
                    total_clean_chars += len(stripped)
                    page_texts.append(f"--- Page {page_idx} ---\n{stripped}")

            if total_clean_chars >= MIN_MEANINGFUL_TEXT_LENGTH:
                combined_text = "\n\n".join(page_texts)
                return True, combined_text, None
            else:
                # Scanned or image-only PDF
                return False, None, "Insufficient selectable text found in PDF. Scanned document requires OCR."

        except Exception as exc:
            error_type = type(exc).__name__
            logger.warning(f"PDF direct text extraction failed for {path.name}: {error_type} - {exc}")
            return False, None, f"PDF extraction error ({error_type})."


pdf_text_service = PDFTextService()
