import { redirect } from "next/navigation";
import InvitesPageClient from "./page-client";

export default async function InvitesPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return <InvitesPageClient teamId={teamId} />;
}
