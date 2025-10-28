import TeamActivityClient from './page-client';

// This is a server component that will handle the params and pass them to the client component
export default function TeamActivityPage({ params }: { params: { teamId: string } }) {
  // Extract teamId directly from params
  const { teamId } = params;
  
  // Pass the teamId to the client component
  return <TeamActivityClient teamId={teamId} />;
}
