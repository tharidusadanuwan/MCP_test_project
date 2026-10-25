
import { Boxes } from "lucide-react";

export default function Footer() {
  return (
    <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex items-center gap-2">
        <Boxes size={15} className="text-cyan-600" />
        <span>© 2026 MCP Test Project</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        <span>Order management &amp; AI workspace</span>
      </div>
    </footer>
  );
}
