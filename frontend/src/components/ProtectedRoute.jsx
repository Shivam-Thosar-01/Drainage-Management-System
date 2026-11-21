
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold text-blue-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;






// import { Navigate, Outlet } from "react-router-dom";
// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";

// const ProtectedRoute = ({ allowedRoles }) => {

//     const { user } = useContext(AuthContext);

//     // Check login
//     if (!user) {
//         return <Navigate to="/" replace />;
//     }

//     // Check user role
//     if (!allowedRoles.includes(user.role)) {
//         return <Navigate to="/" replace />;
//     }

//     return <Outlet />;
// };

// export default ProtectedRoute;
