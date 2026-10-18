interface Props { error: boolean; loading: boolean; onRetry: () => void }

export default function FilterStatus({ error, loading, onRetry }: Props) {
  return <div id="metadata-status" className="metadata-status" hidden={!error}><span>Some filters couldn’t load.</span> <button className="text-button" id="retry-filters" disabled={loading} onClick={onRetry}>Try again</button></div>;
}
