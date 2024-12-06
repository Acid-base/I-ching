from typing import Any, Optional, Union

def run(
    app: Any,
    host: str = ...,
    port: int = ...,
    *,
    reload: Optional[bool] = None,
    workers: Optional[int] = None,
    log_level: Optional[Union[str, int]] = None,
) -> None: ... 