import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Tour Details | LexLuc Global`,
    description: 'Discover amazing travel experiences with our curated tour packages',
  };
}

export default function TourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}