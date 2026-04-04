import React from "react";
import SignupForm from "../components/auth/SignupForm";
import { UserAuth } from "../components/auth/AuthContext";

const Signup = () => {
    return (
        <section id="center">
            <h1>Hello Sign Up</h1>
            <SignupForm/>
        </section>
    );
};

export default Signup;