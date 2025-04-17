# Import models and schemas to expose them at the package level
from divination.models import schemas

# If models.py exists in the same directory:
# from divination.models import models
# Models package initialization
from divination.models.schemas import *  # noqa

__all__ = ["schemas"]
