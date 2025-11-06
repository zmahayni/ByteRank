import EditTeamPageClient from './page-client';

// Server component wrapper
export default async function EditTeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  
  return <EditTeamPageClient teamId={teamId} />;
}
