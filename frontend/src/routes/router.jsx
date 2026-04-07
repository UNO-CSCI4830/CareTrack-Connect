import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import DoctorView from "../pages/DoctorLandingView";
import PatientView from "../pages/PatientLandingView";
import PatientProfileView from "../pages/PatientProfileView";

import WeeklyReportView from "../pages/WeeklyReportView";
import HistoryView from "../pages/HistoryView";
import CheckInView from "../pages/CheckInView";
import LogoutTest from "../pages/logoutTest";

export const router = createBrowserRouter([
    {path: "/", element: <App />},
    {path: "/signup", element: <Signup />},
    
    {path: "/login", element: <Login />},
    {path: "/doctor", element: <DoctorView />},
    {path: "/patient", element: <PatientView />},
    {path: "/patient-profile", element: <PatientProfileView />},
    {path: "/weekly-report", element: <WeeklyReportView />},
    {path: "/history", element: <HistoryView />},
    {path: "/check-in", element: <CheckInView />},
    {path: "/logoutTest", element:<LogoutTest />}, 


]);

