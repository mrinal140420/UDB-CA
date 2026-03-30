import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="panel max-w-md p-6 text-center">
        <h1 className="text-3xl font-bold text-ink-900">403</h1>
        <p className="mt-2 text-ink-600">You do not have permission to access this page.</p>
        <Link className="btn-primary mt-5 inline-block" to="/login">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
