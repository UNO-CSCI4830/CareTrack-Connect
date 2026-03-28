import { createBrowserRouter } from "react-router-dom";
import LogoutTest from "../pages/DoctorLandingView";


export const router = createBrowserRouter([
    {path: "/", element: <DoctorView />},
    {path: "/signup", element: <Signup />},
    {path: "/doctorView", element: <DoctorView />},
    // {path: "/dashboard"}
    //Weekly Report
    //History

]);