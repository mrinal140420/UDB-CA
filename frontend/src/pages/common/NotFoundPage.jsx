import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="panel max-w-md p-6 text-center">
        <h1 className="text-3xl font-bold text-ink-900">404</h1>
        <p className="mt-2 text-ink-600">Page not found in Smart Inventory dashboard.</p>
        <Link className="btn-primary mt-5 inline-block" to="/login">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
