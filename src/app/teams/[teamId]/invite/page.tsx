import TeamInvitePageClient from "./page-client";

export default async function TeamInvitePage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return <TeamInvitePageClient teamId={teamId} />;
}
