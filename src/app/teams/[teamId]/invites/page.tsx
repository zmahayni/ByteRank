import { redirect } from "next/navigation";
import InvitesPageClient from "./page-client";

export default function InvitesPage({ params }: { params: { teamId: string } }) {
  return <InvitesPageClient teamId={params.teamId} />;
}
