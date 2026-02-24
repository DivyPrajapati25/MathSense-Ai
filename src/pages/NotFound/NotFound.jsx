import { Link } from "react-router-dom";

const NotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-green-50">
        <div className="text-center px-6">
            <h1 className="text-8xl font-bold bg-linear-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
                404
            </h1>
            <p className="text-xl text-gray-600 mb-6">Page not found</p>
            <Link
                to="/"
                className="inline-flex items-center justify-center h-10 px-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
                Back to Dashboard
            </Link>
        </div>
    </div>
);

export default NotFound;
