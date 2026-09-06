import io
import logging
import os
import shutil
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image
import pymupdf
import pytesseract

logger = logging.getLogger(__name__)

# Map ISO-639-1 language codes to Tesseract language models
TESSERACT_LANG_MAP = {
    "en": "eng",
    "ta": "tam",
    "hi": "hin",
    "ml": "mal",
    "te": "tel",
    "kn": "kan",
}

COMMON_WINDOWS_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expanduser(r"~\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"),
]


class BaseOCRProvider:
    """Base interface for interchangeable OCR providers."""
    provider_name: str = "BaseOCR"

    def is_available(self) -> bool:
        raise NotImplementedError

    def extract_text_from_image(self, image: Image.Image, lang: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str]]:
        raise NotImplementedError


class TesseractOCRProvider(BaseOCRProvider):
    """
    Local Tesseract OCR Provider.
    Gracefully detects tesseract binary availability and handles language models.
    """
    provider_name = "Tesseract-Local"

    def __init__(self):
        self._configure_binary()

    def _configure_binary(self) -> None:
        """Locate tesseract binary on host system."""
        # 1. Check if configured in environment
        env_cmd = os.environ.get("TESSERACT_CMD")
        if env_cmd and os.path.exists(env_cmd):
            pytesseract.pytesseract.tesseract_cmd = env_cmd
            return

        # 2. Check system PATH
        which_path = shutil.which("tesseract")
        if which_path:
            pytesseract.pytesseract.tesseract_cmd = which_path
            return

        # 3. Check common Windows installation paths
        for win_path in COMMON_WINDOWS_TESSERACT_PATHS:
            if os.path.exists(win_path):
                pytesseract.pytesseract.tesseract_cmd = win_path
                return

    def is_available(self) -> bool:
        """Check if Tesseract executable is functional on this system."""
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def get_available_languages(self) -> list[str]:
        """Return list of installed tesseract language packs."""
        try:
            return pytesseract.get_languages()
        except Exception:
            return ["eng"]

    def extract_text_from_image(self, image: Image.Image, lang: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str]]:
        if not self.is_available():
            return False, None, "OCR engine is not available on this system."

        tess_lang = TESSERACT_LANG_MAP.get(lang or "en", "eng")
        available_langs = self.get_available_languages()

        # If requested language is not installed, fallback to eng or combination
        if tess_lang not in available_langs:
            if "eng" in available_langs:
                logger.info(f"Requested OCR language '{tess_lang}' not installed. Falling back to 'eng'.")
                tess_lang = "eng"
            else:
                return False, None, f"Requested OCR language model '{tess_lang}' is not installed."

        try:
            text = pytesseract.image_to_string(image, lang=tess_lang)
            return True, text.strip(), None
        except Exception as exc:
            error_type = type(exc).__name__
            logger.error(f"Tesseract OCR processing failed: {error_type} - {exc}")
            return False, None, f"OCR processing failed ({error_type})."


class OCRService:
    """
    Unified OCR Service for extracting text from image documents (PNG, JPG, JPEG)
    and scanned PDF documents.
    """

    def __init__(self, provider: Optional[BaseOCRProvider] = None):
        self.provider = provider or TesseractOCRProvider()

    def extract_text(self, file_path: str | Path, language: Optional[str] = "en") -> Tuple[bool, Optional[str], Optional[str], str]:
        """
        Extract text from an image or scanned PDF file.

        Returns:
            (success: bool, extracted_text: Optional[str], error_message: Optional[str], provider_name: str)
        """
        path = Path(file_path)
        provider_name = self.provider.provider_name

        if not path.exists():
            return False, None, f"Document file not found: {path.name}", provider_name

        ext = path.suffix.lower()

        # Handle Image formats
        if ext in (".png", ".jpg", ".jpeg"):
            try:
                with Image.open(path) as img:
                    # Convert to RGB if palette/RGBA
                    if img.mode not in ("RGB", "L"):
                        img = img.convert("RGB")
                    success, text, err = self.provider.extract_text_from_image(img, lang=language)
                    return success, text, err, provider_name
            except Exception as exc:
                error_type = type(exc).__name__
                return False, None, f"Image processing failed ({error_type}).", provider_name

        # Handle Scanned PDF format (render page-by-page)
        elif ext == ".pdf":
            try:
                doc = pymupdf.open(str(path))
                if len(doc) == 0:
                    return False, None, "PDF document is empty.", provider_name

                page_texts: list[str] = []
                for page_idx, page in enumerate(doc, start=1):
                    pix = page.get_pixmap(dpi=200)
                    img_bytes = pix.tobytes("png")
                    with Image.open(io.BytesIO(img_bytes)) as page_img:
                        success, page_text, err = self.provider.extract_text_from_image(page_img, lang=language)
                        if not success:
                            return False, None, err, provider_name
                        if page_text:
                            page_texts.append(f"--- Page {page_idx} ---\n{page_text}")

                combined = "\n\n".join(page_texts).strip()
                if not combined:
                    return True, "[No readable text found in scanned document]", None, provider_name

                return True, combined, None, provider_name

            except Exception as exc:
                error_type = type(exc).__name__
                return False, None, f"Scanned PDF OCR failed ({error_type}).", provider_name

        else:
            return False, None, f"Unsupported file extension for OCR: {ext}", provider_name


ocr_service = OCRService()
