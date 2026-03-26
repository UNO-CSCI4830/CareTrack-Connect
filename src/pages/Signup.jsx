import React from "react";
import SignupForm  from "../features/authentication/components/SignupForm"; 
import { UserAuth } from "../features/authentication/components/AuthContext";

const Signup = () => {
    return (
        <section id="center">
            <h1>Hello Sign Up</h1>
            <SignupForm/>
        </section>
    );
};

export default Signup;