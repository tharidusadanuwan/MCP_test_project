
import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


# --------------------------------------------------
# Environment configuration
# --------------------------------------------------

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
server_python = os.getenv("MCP_SERVER_PYTHON")
server_path = os.getenv("MCP_SERVER_PATH")

if not api_key:
    raise RuntimeError("OPENAI_API_KEY is missing from .env")

if not server_python or not server_path:
    raise RuntimeError("MCP server paths are missing from .env")

if not Path(server_python).is_file():
    raise RuntimeError(f"Python executable not found: {server_python}")

if not Path(server_path).is_file():
    raise RuntimeError(f"MCP server file not found: {server_path}")


client = OpenAI(api_key=api_key)

server_params = StdioServerParameters(
    command=server_python,
    args=[server_path],
)


# --------------------------------------------------
# MCP result compatibility helpers
# --------------------------------------------------

def get_attribute(obj, *names, default=None):
    """Return the first available attribute from the supplied names."""
    for name in names:
        value = getattr(obj, name, None)
        if value is not None:
            return value
    return default


def serialize_mcp_result(tool_result):
    """Convert an MCP tool response into JSON-safe data."""

    raw_content = get_attribute(
        tool_result,
        "content",
        default=[],
    ) or []

    content = []

    for item in raw_content:
        item_type = get_attribute(item, "type", default="unknown")

        if item_type == "text":
            content.append({
                "type": "text",
                "text": get_attribute(item, "text", default=""),
            })
        else:
            content.append({
                "type": str(item_type),
                "data": str(item),
            })

    # Support different SDK naming conventions.
    is_error = bool(
        get_attribute(
            tool_result,
            "isError",
            "is_error",
            default=False,
        )
    )

    result = {
        "is_error": is_error,
        "content": content,
    }

    structured = get_attribute(
        tool_result,
        "structuredContent",
        "structured_content",
    )

    if structured is not None:
        result["structured_content"] = structured

    # Include a textual summary for the AI.
    text_parts = [
        item["text"]
        for item in content
        if item["type"] == "text" and item.get("text")
    ]

    if text_parts:
        result["text"] = "\n".join(text_parts)

    return result


# --------------------------------------------------
# Main application
# --------------------------------------------------

async def main():
    print("Connecting to MCP server...")

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            mcp_response = await session.list_tools()
            mcp_tools = mcp_response.tools

            print("MCP connected successfully.")
            print("Available tools:", [tool.name for tool in mcp_tools])

            tools = [
                {
                    "type": "function",
                    "name": tool.name,
                    "description": tool.description or "",
                    "parameters": tool.input_schema,
                }
                for tool in mcp_tools
            ]

            known_tools = {tool.name for tool in mcp_tools}

            print("\nAI Order Assistant")
            print("Ask about orders, or type 'exit' to quit.")
            print("Example: Show me order 1\n")

            while True:
                try:
                    question = input("You: ").strip()
                except (EOFError, KeyboardInterrupt):
                    print("\nGoodbye!")
                    break

                if question.lower() in {"exit", "quit"}:
                    print("Goodbye!")
                    break

                if not question:
                    continue

                conversation = [
                    {
                        "role": "user",
                        "content": question,
                    }
                ]

                instructions = (
                    "You are an AI order assistant for MCP_test_project. "
                    "Use the available MCP tools to retrieve real order "
                    "information. Never invent order details. If a tool "
                    "returns an error, explain that clearly. After receiving "
                    "a successful result, answer using that result. Do not "
                    "call a tool again when the result already answers the "
                    "question. Only perform read-only operations."
                )

                try:
                    for attempt in range(6):
                        response = client.responses.create(
                            model=model,
                            instructions=instructions,
                            input=conversation,
                            tools=tools,
                            parallel_tool_calls=False,
                        )

                        conversation.extend(response.output)

                        calls = [
                            item
                            for item in response.output
                            if item.type == "function_call"
                        ]

                        if not calls:
                            print(
                                "\nAssistant:",
                                response.output_text or "(No text returned)",
                                "\n",
                            )
                            break

                        # Execute one tool call per round.
                        call = calls[0]
                        print(f"\nCalling MCP tool: {call.name}")

                        if call.name not in known_tools:
                            result = {
                                "is_error": True,
                                "error": f"Unknown MCP tool: {call.name}",
                            }
                        else:
                            try:
                                arguments = json.loads(call.arguments)
                                print("Tool arguments:", arguments)

                                tool_result = await session.call_tool(
                                    call.name,
                                    arguments,
                                )

                                result = serialize_mcp_result(tool_result)

                                print("MCP is_error:", result["is_error"])
                                print(
                                    "MCP raw result:",
                                    json.dumps(
                                        result,
                                        indent=2,
                                        default=str,
                                    ),
                                )

                                # Detect errors reported inside text too.
                                if result["is_error"]:
                                    result["error"] = (
                                        result.get("text")
                                        or "The MCP tool reported an error."
                                    )

                            except Exception as exc:
                                result = {
                                    "is_error": True,
                                    "error": str(exc),
                                }
                                print("MCP execution exception:", repr(exc))

                        conversation.append({
                            "type": "function_call_output",
                            "call_id": call.call_id,
                            "output": json.dumps(result, default=str),
                        })

                        if result.get("is_error") or result.get("error"):
                            print(
                                "\nThe MCP tool failed. "
                                "Check the diagnostic output above.\n"
                            )
                            break

                    else:
                        print(
                            "\nAssistant: Maximum tool-call rounds reached.\n"
                        )

                except Exception as exc:
                    print(f"\nApplication error: {exc}\n")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nApplication stopped.")
