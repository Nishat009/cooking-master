export default function Toast({ message }: { message: string }) {
  return <div id="toast" className="toast" role="status" aria-live="polite" hidden={!message}>{message}</div>;
}
