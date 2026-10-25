from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    DateTime,
    text,
)

from database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(255), nullable=False)
    product_name = Column(String(200), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    status = Column(
        String(30),
        nullable=False,
        server_default=text("'pending'"),
    )
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )