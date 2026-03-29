import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import DoctorView from "../pages/DoctorLandingView";
import PatientView from "../pages/PatientLandingView";

import WeeklyReportView from "../pages/WeeklyReportView";
import HistoryView from "../pages/HistoryView";

export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup", element: <Signup />},
    {path: "/login", element: <Login />},
    {path: "/doctorView", element: <DoctorView />},
    {path: "/patientView", element: <PatientView />},
]);