import React from "react";
//import SignupForm  from "../features/authentication/components/SignupForm"; 
import { UserAuth } from "../features/authentication/components/AuthContext";
import LoginForm from "../features/authentication/components/LoginForm";

const Login = () => {
    return (
        <section id="center">
            <h1>Hello Log In</h1>
            <LoginForm />
        </section>
    );
};

export default Login;