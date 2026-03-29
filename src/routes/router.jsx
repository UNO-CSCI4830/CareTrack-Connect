import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../pages/Signup";
import DoctorView from "../pages/DoctorLandingView";
import PatientView from "../pages/PatientLandingView";

import WeeklyReportView from "../pages/WeeklyReportView";
import HistoryView from "../pages/HistoryView";

export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup", element: <Signup />},
    {path: "/doctor", element: <DoctorView />},
    {path: "/patient", element: <PatientView />},
    {path: "/patient", element: <PatientView />},
    {path: "/history", element: <HistoryView />},
    {path: "/weekly-report", element: <WeeklyReportView />},
]);