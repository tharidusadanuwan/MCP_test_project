
"use client";

import { Menu, Bell, ChevronDown, Command } from "lucide-react";

type NavbarProps = {
  onMenuClick: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#102a43]">
            MCP Test Project
          </p>
          <p className="mt-1 hidden text-[11px] text-slate-500 sm:block">
            Workspace <span className="mx-1.5">/</span> Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-semibold text-emerald-700">
            Development
          </span>
        </div>

        <button
          type="button"
          aria-label="Notifications"
          title="No new notifications"
          className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <Bell size={19} />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-slate-50"
          aria-label="Administrator profile"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#102a43] text-sm font-bold text-white">
            <Command size={18} />
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-xs font-bold text-slate-800">
              Administrator
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Project workspace
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-slate-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}
