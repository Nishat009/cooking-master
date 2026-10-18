'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="shell route-state"><h1>The kitchen needs a moment.</h1><p>Something went wrong while opening the app.</p><button className="button button-primary" onClick={reset}>Try again</button></main>;
}
