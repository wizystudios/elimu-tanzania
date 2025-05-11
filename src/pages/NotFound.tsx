
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-xl shadow-sm max-w-lg w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-red-100 p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gray-800">404</h1>
          <p className="text-xl text-gray-600 mb-2">Page Not Found</p>
          <p className="text-gray-500 mb-6">
            The page you're looking for doesn't exist or is still under development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link 
              to="/dashboard" 
              className="flex items-center justify-center gap-2 bg-tanzanian-blue text-white py-2 px-6 rounded-md hover:bg-tanzanian-blue/90 transition-colors w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Dashboard
            </Link>
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 border border-tanzanian-blue text-tanzanian-blue py-2 px-6 rounded-md hover:bg-tanzanian-blue/10 transition-colors w-full"
            >
              Go to Home
            </Link>
          </div>
        </div>
        <div className="mt-8 text-sm text-gray-500">
          <p>Error: Route "{location.pathname}" not found</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
