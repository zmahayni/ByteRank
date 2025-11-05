import TeamPageClient from './page-client';

// This is a server component that will handle the params and pass them to the client component
export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  // Await params in Next.js 15
  const { teamId } = await params;
  
  // Pass the teamId to the client component
  return <TeamPageClient teamId={teamId} />;
}