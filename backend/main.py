
import json
import os
from decimal import Decimal
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from openai import AsyncOpenAI
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from database import get_db
from models import Order
from schemas import OrderCreate, OrderResponse, OrderUpdate


# ============================================================
# ENVIRONMENT CONFIGURATION
# ============================================================

load_dotenv(Path(__file__).with_name(".env"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

MCP_SERVER_PYTHON = os.getenv("MCP_SERVER_PYTHON")
MCP_SERVER_PATH = os.getenv("MCP_SERVER_PATH")

ai_client = (
    AsyncOpenAI(api_key=OPENAI_API_KEY)
    if OPENAI_API_KEY
    else None
)


# ============================================================
# INITIALIZE FASTAPI
# ============================================================

app = FastAPI(
    title="MCP Test Project API",
    description="Order management API with an AI order assistant",
    version="1.3.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# CHAT REQUEST SCHEMA
# ============================================================

class ChatRequest(BaseModel):
    message: str


# ============================================================
# STRUCTURED AI RESPONSE SCHEMA
# ============================================================

CHAT_RESPONSE_FORMAT = {
    "type": "json_schema",
    "name": "order_assistant_response",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "answer": {
                "type": "string",
                "description": (
                    "A clear, neatly formatted answer using line breaks "
                    "and labeled sections. Do not write a long paragraph."
                ),
            },
            "chart": {
                "anyOf": [
                    {
                        "type": "object",
                        "properties": {
                            "type": {
                                "type": "string",
                                "enum": ["bar", "line", "pie"],
                            },
                            "title": {
                                "type": "string",
                            },
                            "data": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "label": {
                                            "type": "string",
                                        },
                                        "value": {
                                            "type": "number",
                                        },
                                    },
                                    "required": ["label", "value"],
                                    "additionalProperties": False,
                                },
                            },
                        },
                        "required": ["type", "title", "data"],
                        "additionalProperties": False,
                    },
                    {
                        "type": "null",
                    },
                ],
            },
        },
        "required": ["answer", "chart"],
        "additionalProperties": False,
    },
}


# ============================================================
# MCP RESULT SERIALIZATION
# ============================================================

def serialize_tool_result(tool_result):
    """Convert an MCP result into JSON-safe data."""

    content = []

    for item in getattr(tool_result, "content", []) or []:
        item_type = getattr(item, "type", "unknown")

        if item_type == "text":
            content.append({
                "type": "text",
                "text": getattr(item, "text", ""),
            })
        else:
            content.append({
                "type": str(item_type),
                "data": str(item),
            })

    is_error = bool(
        getattr(
            tool_result,
            "isError",
            getattr(tool_result, "is_error", False),
        )
    )

    result = {
        "is_error": is_error,
        "content": content,
    }

    text_parts = [
        item["text"]
        for item in content
        if item["type"] == "text" and item.get("text")
    ]

    if text_parts:
        result["text"] = "\n".join(text_parts)

    structured_content = getattr(
        tool_result,
        "structuredContent",
        getattr(tool_result, "structured_content", None),
    )

    if structured_content is not None:
        result["structured_content"] = structured_content

    return result


# ============================================================
# PARSE AI RESPONSE
# ============================================================

def parse_assistant_response(response_text: str) -> dict:
    """Parse the structured response and validate optional chart data."""

    fallback = {
        "answer": response_text or "I couldn't generate an answer.",
        "chart": None,
    }

    if not response_text:
        return fallback

    try:
        result = json.loads(response_text)

        if not isinstance(result, dict):
            return fallback

        answer = result.get("answer")
        chart = result.get("chart")

        if not isinstance(answer, str):
            return fallback

        if chart is not None:
            if (
                not isinstance(chart, dict)
                or chart.get("type") not in {"bar", "line", "pie"}
                or not isinstance(chart.get("title"), str)
                or not isinstance(chart.get("data"), list)
            ):
                chart = None
            else:
                valid_data = []

                for point in chart["data"]:
                    if not isinstance(point, dict):
                        continue

                    label = point.get("label")
                    value = point.get("value")

                    if (
                        isinstance(label, str)
                        and isinstance(value, (int, float))
                        and not isinstance(value, bool)
                        and __import__("math").isfinite(value)
                    ):
                        valid_data.append({
                            "label": label,
                            "value": value,
                        })

                chart = {
                    "type": chart["type"],
                    "title": chart["title"],
                    "data": valid_data,
                }

                if not valid_data:
                    chart = None

        return {
            "answer": answer,
            "chart": chart,
        }

    except (json.JSONDecodeError, TypeError, ValueError):
        return fallback


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "MCP Test Project backend is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {"status": "ok"}


# ============================================================
# CREATE AN ORDER
# ============================================================

@app.post(
    "/orders",
    response_model=OrderResponse,
    status_code=201,
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    total = (
        order_data.quantity * order_data.unit_price
    ).quantize(Decimal("0.01"))

    order = Order(
        customer_name=order_data.customer_name,
        customer_email=str(order_data.customer_email),
        product_name=order_data.product_name,
        quantity=order_data.quantity,
        unit_price=order_data.unit_price,
        total_amount=total,
        status="pending",
    )

    try:
        db.add(order)
        db.commit()
        db.refresh(order)
        return order
    except Exception:
        db.rollback()
        raise


# ============================================================
# READ ALL ORDERS
# ============================================================

@app.get(
    "/orders",
    response_model=list[OrderResponse],
)
def list_orders(
    db: Session = Depends(get_db),
):
    return (
        db.query(Order)
        .order_by(Order.created_at.desc())
        .limit(100)
        .all()
    )


# ============================================================
# READ ONE ORDER
# ============================================================

@app.get(
    "/orders/{order_id}",
    response_model=OrderResponse,
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return order


# ============================================================
# UPDATE AN ORDER
# ============================================================

@app.put(
    "/orders/{order_id}",
    response_model=OrderResponse,
)
def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db),
):
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    order.customer_name = order_data.customer_name
    order.customer_email = str(order_data.customer_email)
    order.product_name = order_data.product_name
    order.quantity = order_data.quantity
    order.unit_price = order_data.unit_price

    order.total_amount = (
        order_data.quantity * order_data.unit_price
    ).quantize(Decimal("0.01"))

    order.status = order_data.status

    try:
        db.commit()
        db.refresh(order)
        return order
    except Exception:
        db.rollback()
        raise


# ============================================================
# DELETE AN ORDER
# ============================================================

@app.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = db.get(Order, order_id)

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    try:
        db.delete(order)
        db.commit()

        return {
            "message": f"Order {order_id} deleted successfully"
        }
    except Exception:
        db.rollback()
        raise


# ============================================================
# AI CHAT ENDPOINT
# ============================================================

@app.post("/chat")
async def chat(request: ChatRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Please enter a message.",
        )

    if ai_client is None:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured in backend/.env.",
        )

    if not MCP_SERVER_PYTHON or not MCP_SERVER_PATH:
        raise HTTPException(
            status_code=500,
            detail="MCP server paths are missing from backend/.env.",
        )

    if not Path(MCP_SERVER_PYTHON).is_file():
        raise HTTPException(
            status_code=500,
            detail="Configured MCP Python executable was not found.",
        )

    if not Path(MCP_SERVER_PATH).is_file():
        raise HTTPException(
            status_code=500,
            detail="Configured MCP server file was not found.",
        )

    server_params = StdioServerParameters(
        command=MCP_SERVER_PYTHON,
        args=[MCP_SERVER_PATH],
        cwd=str(Path(MCP_SERVER_PATH).parent),
    )

    try:
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()

                mcp_response = await session.list_tools()
                mcp_tools = mcp_response.tools

                tools = [
                    {
                        "type": "function",
                        "name": tool.name,
                        "description": tool.description or "",
                        "parameters": tool.input_schema,
                    }
                    for tool in mcp_tools
                ]

                known_tools = {
                    tool.name for tool in mcp_tools
                }

                conversation = [
                    {
                        "role": "user",
                        "content": message,
                    }
                ]

                instructions = """
You are the AI Order Assistant for MCP_test_project.

Use MCP tools to retrieve real order information. Never invent
customer details, order values, statuses, dates, or statistics.
Only perform read-only operations.

TOOL USAGE
- Use get_order for a specific order.
- Use list_orders for multiple orders, recent orders, comparisons,
  or order statistics.
- If the order ID is missing and cannot be inferred, ask the user
  which order they mean.
- Explain missing records and tool errors accurately.

IMPORTANT: FORMAT ORDER DETAILS CLEARLY
Do not return order details as one long paragraph.
Use separate lines, section headings, and concise labeled fields.
Use plain text and Unicode symbols, not Markdown syntax, because
the chat interface displays the answer as plain text.

When displaying a single order, use this layout:

📦 ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━
Order ID: #<actual order ID>

👤 CUSTOMER
Name: <customer name>
Email: <customer email>

🛍️ PRODUCT
Product: <product name>
Quantity: <actual quantity>
Unit price: <actual unit price>

💰 PAYMENT SUMMARY
Total amount: <actual total amount>

📌 ORDER STATUS
Status: <actual status>
Created: <actual creation date>

Only include values returned by the MCP tools. If a field is
unavailable, say "Not available" instead of inventing a value.
Format dates in a human-readable way when the source provides
a valid date. Use the currency only if it is known; do not assume
a currency symbol from the numeric amount alone.

For multiple orders, use a concise heading and one clearly
separated block per order. Keep the important fields easy to scan.

For general questions, use a short answer and bullet-like lines
when helpful. Avoid unnecessarily long paragraphs.

CHART RULES
- Return the required JSON response with answer and chart.
- Set chart to null when a chart is not requested or appropriate.
- If a chart is requested, use only numerical values supported
  by MCP tool results.
- Supported chart types are bar, line, and pie.
- Every chart point must contain a string label and a numeric value.
- Never invent delivery progress percentages or tracking milestones.
- An order status is a category, not a numerical percentage.
- For one order, appropriate numerical comparisons can include
  quantity, unit price, and total amount.
- For multiple orders, compare total amounts or show status counts
  only when the retrieved data supports them.
- If required data is missing, explain the limitation and return
  chart as null.

Always return an answer string and a chart object or null.
The chart object must contain type, title, and data.
Each data item must contain label and value.
"""

                for _ in range(6):
                    response = await ai_client.responses.create(
                        model=OPENAI_MODEL,
                        instructions=instructions,
                        input=conversation,
                        tools=tools,
                        parallel_tool_calls=False,
                        text={
                            "format": CHAT_RESPONSE_FORMAT
                        },
                    )

                    conversation.extend(response.output)

                    calls = [
                        item
                        for item in response.output
                        if item.type == "function_call"
                    ]

                    if not calls:
                        return parse_assistant_response(
                            response.output_text
                        )

                    for call in calls:
                        if call.name not in known_tools:
                            result = {
                                "is_error": True,
                                "error": f"Unknown MCP tool: {call.name}",
                            }
                        else:
                            try:
                                arguments = json.loads(call.arguments)

                                tool_result = await session.call_tool(
                                    call.name,
                                    arguments,
                                )

                                result = serialize_tool_result(
                                    tool_result
                                )

                                if result["is_error"]:
                                    result["error"] = (
                                        result.get("text")
                                        or "MCP tool execution failed."
                                    )

                            except Exception as exc:
                                print(
                                    f"MCP tool error ({call.name}): {exc}"
                                )
                                result = {
                                    "is_error": True,
                                    "error": (
                                        "The requested order data "
                                        "could not be retrieved."
                                    ),
                                }

                        conversation.append({
                            "type": "function_call_output",
                            "call_id": call.call_id,
                            "output": json.dumps(
                                result,
                                default=str,
                            ),
                        })

                return {
                    "answer": (
                        "I couldn't complete the request within the "
                        "allowed number of tool calls. Please try again."
                    ),
                    "chart": None,
                }

    except HTTPException:
        raise

    except Exception as exc:
        print(f"Chat endpoint error: {exc}")

        raise HTTPException(
            status_code=500,
            detail=(
                "The AI assistant could not process your request. "
                "Check the backend terminal for details."
            ),
        ) from exc
