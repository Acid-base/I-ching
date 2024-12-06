from typing import Any, Callable, TypeVar, Optional, Type
from typing_extensions import Protocol

# Define a protocol for BaseModel since we can't import pydantic
class BaseModel(Protocol):
    class Config:
        frozen: bool = False

T = TypeVar('T')
ResponseT = TypeVar('ResponseT')

class FastAPI:
    def __init__(self, *, title: str = ...) -> None: ...
    def get(self, path: str) -> Callable[[Callable[..., T]], Callable[..., T]]: ...
    def post(
        self, 
        path: str, 
        *, 
        response_model: Optional[Type[ResponseT]] = None
    ) -> Callable[[Callable[..., Any]], Callable[..., ResponseT]]: ...
    def mount(self, path: str, app: Any, name: str) -> None: ...

class HTTPException(Exception):
    def __init__(self, status_code: int, detail: Optional[str] = None) -> None: ...

class StaticFiles:
    def __init__(self, *, directory: str) -> None: ...

class FileResponse:
    def __init__(self, path: str) -> None: ... 