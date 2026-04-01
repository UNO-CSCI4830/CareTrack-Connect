import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import DoctorView from "../pages/DoctorLandingView";
import PatientView from "../pages/PatientLandingView";

import WeeklyReportView from "../pages/WeeklyReportView";
import HistoryView from "../pages/HistoryView";
import CheckInView from "../pages/CheckInView";

export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup", element: <Signup />},
    {path: "/login", element: <Login />},
    {path: "/doctor", element: <DoctorView />},
    {path: "/patient", element: <PatientView />},
    {path: "/weekly-report", element: <WeeklyReportView />},
    {path: "/history", element: <HistoryView />},
    {path: "/check-in", element: <CheckInView />},

]);