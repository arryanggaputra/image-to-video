import { Home, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full text-center">
        <div className="text-6xl font-bold text-gray-300 mb-4">404</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>

        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="space-y-3">
          <Link
            to="/"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
