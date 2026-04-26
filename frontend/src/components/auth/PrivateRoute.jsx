import { Navigate } from "react-router-dom";
import { UserAuth } from "./AuthContext";

const PrivateRoute = ({ children }) => {
    const { session } = UserAuth();

    if (session === undefined) {
        return null; // still loading, don't flash anything
    }

    if (!session) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
