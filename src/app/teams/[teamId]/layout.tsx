import { ReactNode } from "react";
// Remove unused import
// import TeamTabs from "@/components/TeamTabs";

export default async function TeamLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ teamId: string }>;
}) {
  // Await params in Next.js 15+
  const { teamId } = await params;
  
  return (
    <section>
      {/* Page content */}
      {children}
    </section>
  );
}
