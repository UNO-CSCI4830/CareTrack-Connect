import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../pages/Signup";
export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup", element: <Signup />}
]);