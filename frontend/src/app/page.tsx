
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  CheckCircle2,
  Database,
  Network,
  Sparkles,
  Workflow,
  ChartNoAxesCombined,
  MessageSquareText,
  ShieldCheck,
  Server,
  Zap,
  Activity,
} from "lucide-react";

const applications = [
  {
    title: "AI Order Assistant",
    description:
      "Ask natural-language questions about orders, retrieve records through MCP, and visualize supported data using interactive charts.",
    href: "/ai-client",
    label: "AI + MCP",
    icon: Bot,
    iconClass: "bg-cyan-50 text-cyan-700",
    badgeClass: "bg-cyan-50 text-cyan-800",
    features: ["Natural-language chat", "Bar, line and pie charts"],
  },
  {
    title: "Manage Orders",
    description:
      "View and manage customer orders, product details, quantities, prices, and order statuses through your FastAPI backend.",
    href: "/orders",
    label: "ORDER MANAGEMENT",
    icon: Boxes,
    iconClass: "bg-blue-50 text-blue-700",
    badgeClass: "bg-blue-50 text-blue-800",
    features: ["Create and update orders", "Search and filter records"],
  },
];

const architecture = [
  {
    title: "Next.js Frontend",
    subtitle: "User interface",
    description:
      "Dashboard, order management, AI conversations, and interactive data visualizations.",
    icon: Network,
    tag: "FRONTEND",
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "FastAPI Backend",
    subtitle: "Application API",
    description:
      "Handles order CRUD operations and coordinates requests between OpenAI and MCP tools.",
    icon: Server,
    tag: "BACKEND",
    color: "bg-cyan-50 text-cyan-700",
  },
  {
    title: "MCP Server",
    subtitle: "AI tool integration",
    description:
      "Exposes order lookup tools so the AI assistant can retrieve real order information.",
    icon: Workflow,
    tag: "MCP",
    color: "bg-violet-50 text-violet-700",
  },
  {
    title: "PostgreSQL",
    subtitle: "Persistent data",
    description:
      "Stores customer and order records used by the order-management system.",
    icon: Database,
    tag: "DATABASE",
    color: "bg-emerald-50 text-emerald-700",
  },
];

const capabilities = [
  {
    title: "AI-powered order queries",
    description:
      "Ask questions in everyday language instead of manually searching order records.",
    icon: MessageSquareText,
  },
  {
    title: "Interactive data charts",
    description:
      "Display supported numerical data in bar, line, and pie charts inside conversations.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Read-only AI tools",
    description:
      "The configured MCP tools retrieve information without using the assistant to modify orders.",
    icon: ShieldCheck,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-6">
      {/* ================================================== */}
      {/* WELCOME HERO */}
      {/* ================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-[#102a43] p-6 text-white sm:p-9 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-cyan-300/10" />
        <div className="pointer-events-none absolute -right-2 -top-14 h-52 w-52 rounded-full border border-cyan-300/15" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-cyan-200">
            <Sparkles size={14} />
            YOUR AI-POWERED WORKSPACE
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
            Welcome to{" "}
            <span className="text-[#35cfe3]">
              MCP Test Project
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Manage customer orders, ask your AI assistant questions,
            and visualize order data in one workspace powered by
            Next.js, FastAPI, OpenAI, MCP, and PostgreSQL.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/ai-client"
              className="inline-flex items-center gap-2 rounded-xl bg-[#35cfe3] px-5 py-3 text-sm font-bold text-[#102a43] transition hover:bg-cyan-200"
            >
              <Bot size={17} />
              Open AI Assistant
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Boxes size={17} />
              Manage Orders
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-300" />
              MCP tool integration
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-300" />
              Structured chart responses
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-cyan-300" />
              PostgreSQL-backed orders
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* APPLICATIONS */}
      {/* ================================================== */}

      <section>
        <div className="mb-5">
          <p className="section-label">APPLICATIONS</p>
          <h2 className="mt-2 text-xl font-bold text-[#102a43]">
            Your workspace
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Open a module to work with your order data.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {applications.map((application) => {
            const Icon = application.icon;

            return (
              <Link
                key={application.href}
                href={application.href}
                className="dashboard-card group flex min-h-[255px] flex-col p-6 transition duration-200 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${application.iconClass}`}
                  >
                    <Icon size={24} />
                  </div>

                  <span
                    className={`rounded-lg px-2.5 py-1.5 text-[9px] font-bold tracking-wider ${application.badgeClass}`}
                  >
                    {application.label}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#102a43]">
                  {application.title}
                </h3>

                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  {application.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {application.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-600"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-cyan-700">
                  Open workspace
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================================================== */}
      {/* AI CAPABILITIES */}
      {/* ================================================== */}

      <section>
        <div className="mb-5">
          <p className="section-label">AI CAPABILITIES</p>
          <h2 className="mt-2 text-xl font-bold text-[#102a43]">
            What your assistant can do
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Use natural language to explore information from your
            order system.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {capabilities.map((capability) => {
            const Icon = capability.icon;

            return (
              <div
                key={capability.title}
                className="dashboard-card p-5 transition duration-200 hover:border-cyan-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Icon size={20} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  {capability.title}
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  {capability.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================== */}
      {/* SYSTEM ARCHITECTURE */}
      {/* ================================================== */}

      <section>
        <div className="mb-5">
          <p className="section-label">SYSTEM OVERVIEW</p>
          <h2 className="mt-2 text-xl font-bold text-[#102a43]">
            Project architecture
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            How the frontend, backend, AI tools, and database
            work together.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {architecture.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="dashboard-card p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${service.color}`}
                  >
                    <Icon size={20} />
                  </div>

                  <span className="rounded-md bg-slate-50 px-2 py-1 text-[9px] font-bold tracking-wider text-slate-500">
                    {service.tag}
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  {service.title}
                </h3>

                <p className="mt-1 text-xs font-medium text-cyan-700">
                  {service.subtitle}
                </p>

                <p className="mt-3 text-xs leading-6 text-slate-500">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Workflow visualization */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Workflow size={18} className="text-cyan-700" />
            <h3 className="text-sm font-bold text-[#102a43]">
              AI request workflow
            </h3>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            The main path used when a user asks the AI assistant
            about an order.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "User request",
                detail: "Ask a question in the Next.js chat.",
              },
              {
                number: "02",
                title: "OpenAI",
                detail: "Interpret the request and select a tool.",
              },
              {
                number: "03",
                title: "MCP + database",
                detail: "Retrieve order records through MCP tools.",
              },
              {
                number: "04",
                title: "Answer + chart",
                detail: "Return text and optional chart data.",
              },
            ].map((step, index) => (
              <div
                key={step.number}
                className="relative rounded-xl bg-slate-50 p-4"
              >
                <span className="text-xs font-bold text-cyan-700">
                  {step.number}
                </span>

                <h4 className="mt-2 text-sm font-semibold text-slate-800">
                  {step.title}
                </h4>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {step.detail}
                </p>

                {index < 3 && (
                  <ArrowRight
                    size={15}
                    className="absolute right-3 top-4 hidden text-slate-300 lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* QUICK ACTION / FOOTER PANEL */}
      {/* ================================================== */}

      <section className="dashboard-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
            <Zap size={21} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Ready to explore your order data?
            </h3>

            <p className="mt-1 max-w-xl text-xs leading-6 text-slate-500">
              Ask the assistant to retrieve an order, compare
              multiple orders, or create a chart from available
              numerical data.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/ai-client"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102a43] px-4 py-3 text-xs font-semibold !text-white transition hover:bg-[#193b59]"
          >
            <Bot size={15} />
            Open AI Assistant
            <ArrowRight size={15} />
          </Link>

          <Link
            href="/orders"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Orders
            <Boxes size={15} />
          </Link>
        </div>
      </section>

      {/* Informational system note */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Activity size={13} />
          MCP Test Project · Development workspace
        </span>

        <span>
          Next.js · FastAPI · OpenAI · MCP · PostgreSQL
        </span>
      </div>
    </div>
  );
}
