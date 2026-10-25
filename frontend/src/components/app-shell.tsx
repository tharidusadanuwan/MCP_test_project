
"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import Footer from "./footer";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="dashboard-main">
        <Navbar onMenuClick={() => setMobileOpen(true)} />

        <main className="dashboard-content">{children}</main>

        <Footer />
      </div>
    </div>
  );
}
