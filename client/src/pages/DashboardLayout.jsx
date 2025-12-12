import React from "react";
import DesktopSidebar from "../components/DesktopSidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#151517", color: "white" }}>
      <DesktopSidebar />

      <main className="flex-1 ml-48 p-6">
        {children}
      </main>
    </div>
  );
}
