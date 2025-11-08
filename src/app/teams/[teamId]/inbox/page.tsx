import TeamInboxPageClient from "./page-client";

export default async function TeamInboxPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return <TeamInboxPageClient teamId={teamId} />;
}
