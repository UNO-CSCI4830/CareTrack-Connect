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
import PrivateRoute from "../components/auth/PrivateRoute";

import DoctorCheckInsView from "../pages/DoctorCheckInsView";
import DoctorAppointmentsView from "../pages/DoctorAppointmentsView";
import DoctorReportsView from "../pages/DoctorReportsView";
import AudioCaptureView from "../pages/AudioCaptureView";


import BookAppointmentView from "../pages/BookAppointmentView";
import MyAppointmentsView from "../pages/MyAppointmentsView";
import DoctorAvailabilityView from "../pages/DoctorAvailabilityView";
import DoctorPatientsView from "../pages/DoctorPatientsView";

    
export const router = createBrowserRouter([
{path: "/", element: <App />},
    {path: "/signup", element: <Signup />},
    {path: "/login", element: <Login />},
    {path: "/doctor", element: <PrivateRoute><DoctorView /></PrivateRoute>},
    {path: "/doctor/check-ins", element: <PrivateRoute><DoctorCheckInsView /></PrivateRoute>},
    {path: "/doctor/appointments", element: <PrivateRoute><DoctorAppointmentsView /></PrivateRoute>},
    {path: "/doctor/reports", element: <PrivateRoute><DoctorReportsView /></PrivateRoute>},
    {path: "/patient", element: <PrivateRoute><PatientView /></PrivateRoute>},
    {path: "/patient-profile", element: <PrivateRoute><PatientProfileView /></PrivateRoute>},
    {path: "/weekly-report", element: <PrivateRoute><WeeklyReportView /></PrivateRoute>},
    {path: "/history", element: <PrivateRoute><HistoryView /></PrivateRoute>},
    {path: "/check-in", element: <PrivateRoute><CheckInView /></PrivateRoute>},
    {path: "/logoutTest", element: <PrivateRoute><LogoutTest /></PrivateRoute>},
    {path: "/book-appointment", element: <PrivateRoute><BookAppointmentView /></PrivateRoute>},
    {path: "/my-appointments", element: <PrivateRoute><MyAppointmentsView /></PrivateRoute>},
    {path: "/doctor/availability", element: <PrivateRoute><DoctorAvailabilityView /></PrivateRoute>},
    {path: "/doctor/patients", element: <PrivateRoute><DoctorPatientsView /></PrivateRoute>},
    { path: "/audio-capture", element: <AudioCaptureView /> },
]);
