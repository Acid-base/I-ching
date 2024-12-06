from typing import Protocol, TypeVar, Dict, Any

T = TypeVar('T')

class BaseModel(Protocol):
    class Config:
        frozen: bool = False
        arbitrary_types_allowed: bool = False

    def __init__(self, **kwargs: Any) -> None: ...
    def dict(self) -> Dict[str, Any]: ... 