
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Boxes,
  ChevronRight,
  LayoutDashboard,
  X,
} from "lucide-react";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

const navigation = [
  {
    label: "AI Client",
    href: "/ai-client",
    icon: Bot,
    description: "AI assistant",
  },
  {
    label: "Manage Orders",
    href: "/orders",
    icon: Boxes,
    description: "Order management",
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col bg-[#102a43] text-white transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-[82px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#35cfe3] text-[#102a43] shadow-lg shadow-cyan-950/20">
            <Boxes size={24} strokeWidth={2.4} />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm font-extrabold tracking-wide">
              MCP TEST
            </h1>
            <p className="mt-1 text-[11px] text-slate-400">
              Project workspace
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-8">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
            Workspace
          </p>

          <Link
            href="/"
            onClick={onClose}
            className={`mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
              pathname === "/"
                ? "bg-white/10 font-semibold text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
            {pathname === "/" && (
              <span className="ml-auto h-2 w-2 rounded-full bg-[#35cfe3]" />
            )}
          </Link>
        </div>

        <div className="px-4 pt-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-400">
            Applications
          </p>

          <nav className="space-y-2" aria-label="Main navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                    active
                      ? "border-[#35cfe3]/20 bg-[#35cfe3]/10 text-[#35cfe3]"
                      : "border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={19} />

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-[10px] text-slate-400">
                      {item.description}
                    </span>
                  </span>

                  <ChevronRight
                    size={15}
                    className={`transition ${
                      active
                        ? "text-[#35cfe3]"
                        : "text-slate-500 group-hover:translate-x-0.5"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#35cfe3]" />
              <span className="text-xs font-semibold text-slate-200">
                Development mode
              </span>
            </div>

            <p className="text-[11px] leading-5 text-slate-400">
              Your workspace for AI tools and order management.
            </p>
          </div>

          <p className="mt-4 text-center text-[10px] text-slate-500">
            MCP Test Project · v1.0
          </p>
        </div>
      </aside>
    </>
  );
}
