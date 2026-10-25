
"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bot,
  Send,
  User,
  Sparkles,
  LoaderCircle,
  Trash2,
  PackageSearch,
  AlertCircle,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// ============================================================
// TYPES
// ============================================================

type ChartPoint = {
  label: string;
  value: number;
};

type ChatChart = {
  type: "bar" | "line" | "pie";
  title: string;
  data: ChartPoint[];
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  chart?: ChatChart | null;
};

type ChatResponse = {
  answer?: string;
  chart?: ChatChart | null;
  detail?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const examples = [
  "Show me order 1",
  "Show order 1 in a bar chart",
  "List the latest five orders",
  "Show orders by status in a pie chart",
];

const CHART_COLORS = [
  "#0891B2",
  "#0F766E",
  "#6366F1",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
];

// ============================================================
// CHART COMPONENT
// ============================================================

function AssistantChart({ chart }: { chart: ChatChart }) {
  const validData = chart.data.filter(
    (point) =>
      typeof point.label === "string" &&
      typeof point.value === "number" &&
      Number.isFinite(point.value),
  );

  if (validData.length === 0) {
    return null;
  }

  const chartIcon =
    chart.type === "bar" ? (
      <BarChart3 size={17} />
    ) : chart.type === "line" ? (
      <LineChartIcon size={17} />
    ) : (
      <PieChartIcon size={17} />
    );

  return (
    <div className="mt-4 w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
          {chartIcon}
        </div>

        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold text-slate-800">
            {chart.title}
          </h3>
          <p className="mt-0.5 text-xs capitalize text-slate-500">
            {chart.type} chart · {validData.length} data points
          </p>
        </div>
      </div>

      <div
        className="h-[240px] w-full min-w-0 sm:h-[280px]"
        role="img"
        aria-label={`${chart.type} chart: ${chart.title}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "bar" ? (
            <BarChart
              data={validData}
              margin={{
                top: 8,
                right: 8,
                left: -15,
                bottom: 8,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={{ stroke: "#CBD5E1" }}
                tickLine={false}
                interval={0}
                angle={validData.length > 4 ? -20 : 0}
                textAnchor={validData.length > 4 ? "end" : "middle"}
                height={validData.length > 4 ? 55 : 35}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value ?? 0).toLocaleString(),
                  "Value",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="value"
                name="Value"
                fill="#0891B2"
                radius={[5, 5, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          ) : chart.type === "line" ? (
            <LineChart
              data={validData}
              margin={{
                top: 8,
                right: 12,
                left: -15,
                bottom: 8,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={{ stroke: "#CBD5E1" }}
                tickLine={false}
                interval={0}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />

              <Tooltip
                formatter={(value) => [
                  Number(value ?? 0).toLocaleString(),
                  "Value",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                }}
              />

              <Line
                type="monotone"
                dataKey="value"
                name="Value"
                stroke="#0891B2"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#0891B2",
                  strokeWidth: 2,
                  stroke: "#FFFFFF",
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={validData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="45%"
                outerRadius="72%"
                innerRadius="35%"
                paddingAngle={2}
                labelLine={false}
                label={({ name, percent }) => {
                  const percentage =
                    typeof percent === "number"
                      ? `${(percent * 100).toFixed(0)}%`
                      : "";

                  return `${String(name ?? "")} ${percentage}`;
                }}
              >
                {validData.map((point, index) => (
                  <Cell
                    key={`${point.label}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [
                  Number(value ?? 0).toLocaleString(),
                  "Value",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={30}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-2 border-t border-slate-100 pt-2">
        <p className="text-[11px] text-slate-400">
          Chart generated from the data returned by the assistant.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN CHAT PAGE
// ============================================================

export default function AIClientPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI Order Assistant. Ask me about your orders, and I'll retrieve information from your order system. You can also request charts to visualize available order data.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const conversationRef = useRef<HTMLDivElement>(null);

  // Keep the newest message visible inside the conversation.
  useEffect(() => {
    const container = conversationRef.current;

    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  async function sendMessage(
    event?: FormEvent<HTMLFormElement>,
    suggestedMessage?: string,
  ) {
    event?.preventDefault();

    const message = (suggestedMessage ?? input).trim();

    if (!message || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data: ChatResponse = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "The assistant could not process your request.",
        );
      }

      if (typeof data.answer !== "string") {
        throw new Error(
          "The server returned an unexpected response.",
        );
      }

      // Validate optional chart data before rendering it.
      let chart: ChatChart | null = null;

      if (
        data.chart &&
        typeof data.chart === "object" &&
        ["bar", "line", "pie"].includes(data.chart.type) &&
        typeof data.chart.title === "string" &&
        Array.isArray(data.chart.data)
      ) {
        const validPoints = data.chart.data.filter(
          (point): point is ChartPoint =>
            point !== null &&
            typeof point === "object" &&
            typeof point.label === "string" &&
            typeof point.value === "number" &&
            Number.isFinite(point.value),
        );

        if (validPoints.length > 0) {
          chart = {
            type: data.chart.type,
            title: data.chart.title,
            data: validPoints,
          };
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        chart,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Could not connect to the AI assistant.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // CLEAR CHAT
  // ==========================================================

  function clearChat() {
    if (loading) return;

    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Chat cleared. What would you like to know about your orders?",
      },
    ]);

    setError("");
    setInput("");
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="flex h-[calc(100dvh-64px)] min-h-0 w-full flex-col overflow-hidden px-3 py-0.4 sm:px-4 lg:px-5">
      {/* Page heading */}
      <section className="mb-3 flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-cyan-700 sm:text-sm">
            <Sparkles size={15} />
            MCP-powered assistant
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            AI Order Assistant
          </h1>

          <p className="mt-1 hidden text-sm text-slate-500 sm:block">
            Ask questions and visualize information from your order database.
          </p>
        </div>

        <button
          type="button"
          onClick={clearChat}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Clear chat</span>
          <span className="sm:hidden">Clear</span>
        </button>
      </section>

      {/* Assistant status */}
      <section className="mb-3 flex shrink-0 items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2.5 sm:px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700">
          <Bot size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">
            Order Assistant
          </p>

          <p className="truncate text-xs text-slate-600 sm:text-sm">
            Ask about orders, products, quantities, statuses, and charts.
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-cyan-700 sm:text-xs">
          Read-only
        </span>
      </section>

      {/* Chat panel */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Conversation header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-3 py-3 sm:px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
            <Bot size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-800">
              Conversation
            </h2>

            <p className="text-xs text-slate-500">
              Answers and charts use available order data.
            </p>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="hidden text-xs text-slate-500 sm:inline">
              Assistant ready
            </span>
          </div>
        </div>

        {/* Scrollable conversation */}
        <div
          ref={conversationRef}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4 sm:px-5 sm:py-5"
          aria-live="polite"
          role="log"
          aria-label="Chat conversation"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full items-start gap-2.5 sm:gap-3 ${
                message.role === "user"
                  ? "flex-row-reverse"
                  : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 ${
                  message.role === "user"
                    ? "bg-cyan-100 text-cyan-800"
                    : "bg-slate-900 text-white"
                }`}
              >
                {message.role === "user" ? (
                  <User size={17} />
                ) : (
                  <Bot size={18} />
                )}
              </div>

              <div
                className={`min-w-0 max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 sm:max-w-[82%] sm:px-4 sm:py-3 ${
                  message.role === "user"
                    ? "rounded-tr-sm bg-cyan-600 text-white"
                    : "rounded-tl-sm bg-slate-100 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>

                {/* Render charts only for assistant messages. */}
                {message.role === "assistant" &&
                  message.chart && (
                    <AssistantChart chart={message.chart} />
                  )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white sm:h-9 sm:w-9">
                <Bot size={18} />
              </div>

              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-600">
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
                Checking your orders...
              </div>
            </div>
          )}
        </div>

        {/* Fixed example questions */}
        <div className="shrink-0 border-t border-slate-100 px-3 pt-3 sm:px-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <PackageSearch size={15} />
            Try asking
          </div>

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                disabled={loading}
                onClick={() =>
                  void sendMessage(undefined, example)
                }
                className="shrink-0 rounded-full border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Fixed message composer */}
        <form
          onSubmit={(event) => void sendMessage(event)}
          className="shrink-0 border-t border-slate-100 bg-slate-50 px-3 py-3 sm:px-4"
        >
          {error && (
            <div
              role="alert"
              className="mb-2 flex max-h-20 items-start gap-2 overflow-y-auto rounded-xl border border-red-200 bg-red-50 p-2.5 text-sm text-red-700"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
              />
              <span className="break-words">{error}</span>
            </div>
          )}

          <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100 sm:gap-3">
            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();

                  if (input.trim() && !loading) {
                    void sendMessage();
                  }
                }
              }}
              placeholder="Ask something about your orders..."
              rows={1}
              disabled={loading}
              className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60 sm:max-h-28"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          <p className="mt-1.5 text-[11px] text-slate-400">
            Enter to send · Shift + Enter for a new line
          </p>
        </form>
      </section>
    </main>
  );
}
