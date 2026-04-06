from __future__ import annotations

import re
import unicodedata
from typing import Optional


CODE_PATTERN = re.compile(r"^[a-z]+(?:-[a-z]+)*$")
_NON_ALPHA_RE = re.compile(r"[^a-z]+")
_MULTI_DASH_RE = re.compile(r"-+")


def slugify_letters(value: Optional[str], fallback: str) -> str:
    raw = unicodedata.normalize("NFKD", value or "")
    ascii_text = raw.encode("ascii", "ignore").decode("ascii").lower()
    slug = _NON_ALPHA_RE.sub("-", ascii_text).strip("-")
    slug = _MULTI_DASH_RE.sub("-", slug)

    normalized_fallback = _NON_ALPHA_RE.sub("-", (fallback or "resource").lower()).strip("-")
    normalized_fallback = _MULTI_DASH_RE.sub("-", normalized_fallback) or "resource"
    return slug or normalized_fallback


def alpha_from_int(value: int) -> str:
    if value <= 0:
        return "a"

    result: list[str] = []
    current = value
    while current > 0:
        current -= 1
        current, remainder = divmod(current, 26)
        result.append(chr(ord("a") + remainder))
    return "".join(reversed(result))


def build_resource_code(prefix: str, *, preferred: Optional[str], entity_id: int) -> str:
    base = slugify_letters(preferred, prefix)
    suffix = alpha_from_int(entity_id)
    return f"{base}-{suffix}"


def is_valid_resource_code(value: Optional[str]) -> bool:
    if value is None:
        return False
    return bool(CODE_PATTERN.fullmatch(str(value).strip()))


def normalize_external_ref(value: object) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None
