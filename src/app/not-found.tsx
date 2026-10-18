import Link from 'next/link';

export default function NotFound() {
  return <main className="shell route-state"><h1>This recipe took a wrong turn.</h1><p>The page you’re looking for doesn’t exist.</p><Link className="button button-primary" href="/">Back to the kitchen</Link></main>;
}
