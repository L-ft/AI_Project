from pydantic import BaseModel


class PromptLibraryItem(BaseModel):
    id: str
    title: str
    instruction: str
