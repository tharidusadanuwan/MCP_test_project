
import os
from decimal import Decimal

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from mcp.server.fastmcp import FastMCP

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing from mcp-server/.env")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

mcp = FastMCP("MCP Test Project Order Server")


@mcp.tool()
def get_order(order_id: int) -> dict:
    """Retrieve an order by its ID from the orders table."""
    with engine.connect() as connection:
        row = connection.execute(
            text("""
                SELECT id, customer_name, customer_email,
                       product_name, quantity, unit_price,
                       total_amount, status, created_at
                FROM orders
                WHERE id = :order_id
            """),
            {"order_id": order_id},
        ).mappings().first()

    if row is None:
        return {"error": f"Order {order_id} was not found"}

    result = dict(row)
    result["unit_price"] = str(result["unit_price"])
    result["total_amount"] = str(result["total_amount"])
    result["created_at"] = result["created_at"].isoformat()

    return result


@mcp.tool()
def list_orders(limit: int = 10) -> list[dict]:
    """List recent orders, with a maximum of 50 records."""
    limit = max(1, min(limit, 50))

    with engine.connect() as connection:
        rows = connection.execute(
            text("""
                SELECT id, customer_name, product_name,
                       quantity, total_amount, status, created_at
                FROM orders
                ORDER BY created_at DESC
                LIMIT :limit
            """),
            {"limit": limit},
        ).mappings().all()

    results = []

    for row in rows:
        item = dict(row)
        item["total_amount"] = str(item["total_amount"])
        item["created_at"] = item["created_at"].isoformat()
        results.append(item)

    return results


if __name__ == "__main__":
    mcp.run(transport="stdio")
