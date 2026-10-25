
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    EmailStr,
)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=100)
    customer_email: EmailStr
    product_name: str = Field(min_length=1, max_length=200)
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )


class OrderUpdate(BaseModel):
    customer_name: str = Field(min_length=1, max_length=100)
    customer_email: EmailStr
    product_name: str = Field(min_length=1, max_length=200)
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )
    status: Literal[
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
    ] = "pending"


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    customer_email: str
    product_name: str
    quantity: int
    unit_price: Decimal
    total_amount: Decimal
    status: str
    created_at: datetime
