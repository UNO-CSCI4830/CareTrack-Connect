import { createBrowserRouter } from "react-router-dom";


export const router = createBrowserRouter([
    {path: "/", element: <DoctorView />},
    {path: "/signup", element: <Signup />},
    {path: "/doctorView", element: <DoctorView />},
    // {path: "/dashboard"}
    //Weekly Report
    //History

]);