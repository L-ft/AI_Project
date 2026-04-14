from pydantic import BaseModel, Field


class DataBuilderSettingsOut(BaseModel):
    encrypt_fulltext_enabled: bool
    max_insert_select_rows: int = Field(ge=1, le=500_000_000)


class DataBuilderSettingsPatch(BaseModel):
    encrypt_fulltext_enabled: bool | None = None
    max_insert_select_rows: int | None = Field(default=None, ge=1, le=500_000_000)
