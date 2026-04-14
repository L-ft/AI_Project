from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

from app.data_builder.schemas.prompts import PromptLibraryItem

_LIB_PATH = Path(__file__).resolve().parent.parent / "prompts" / "library.json"


@lru_cache
def load_prompt_library_raw() -> list[dict]:
    if not _LIB_PATH.is_file():
        return []
    try:
        data = json.loads(_LIB_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, list) else []
    except Exception:
        return []


def list_prompt_library() -> list[PromptLibraryItem]:
    out: list[PromptLibraryItem] = []
    for row in load_prompt_library_raw():
        if not isinstance(row, dict):
            continue
        try:
            out.append(
                PromptLibraryItem(
                    id=str(row["id"]),
                    title=str(row["title"]),
                    instruction=str(row["instruction"]),
                )
            )
        except KeyError:
            continue
    return out
