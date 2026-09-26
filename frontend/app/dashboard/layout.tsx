import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export const metadata: Metadata = {
  title: "Developer Dashboard",
  robots: {
    index: false,
    follow: false
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
      {/* Dynamic Client Sidebar with Developer Identity */}
      <DashboardSidebar />

      {/* Dashboard Main Workspace */}
      <section className="flex-1 w-full min-w-0">
        {children}
      </section>
    </div>
  );
}
