import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../pages/Signup";
import DoctorView from "../pages/DoctorLandingView";
import PatientView from "../pages/PatientLandingView";

export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup", element: <Signup />},
    {path: "/doctorView", element: <DoctorView />},
    {path: "/patientView", element: <PatientView />},
]);