import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-container text-center">
      <h1 className="font-display text-4xl text-ink-900 mb-4">Page not found</h1>
      <p className="font-sans text-ink-500 mb-8">
        The page you&#39;re looking for doesn&#39;t exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
