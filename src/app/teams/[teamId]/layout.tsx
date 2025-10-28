import { ReactNode } from "react";
// Remove unused import
// import TeamTabs from "@/components/TeamTabs";

export default async function TeamLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { teamId: string };
}) {
  return (
    <section>
      {/* Page content */}
      {children}
    </section>
  );
}
