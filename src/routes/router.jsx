import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import DoctorView from "../pages/DoctorLandingView";
import PatientView from "../pages/PatientLandingView";
import LogoutTest from "../pages/logoutTest";

export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup/:role", element: <Signup />},

    {path: "/login", element: <Login />},
    {path: "/doctorView", element: <DoctorView />},
    {path: "/patientView", element: <PatientView />},
    {path: "/logoutTest", element:<LogoutTest />}, 
]);