import React, { useState } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserAuth } from "./AuthContext";

const SignupForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("");
    console.log("This " + UserAuth());
    const {session, signUpNewUser } = UserAuth();
    const navigate = useNavigate()

    console.log(session)
    
    const handleSignUp = async (e) => { 
        e.preventDefault();
        setLoading(true);
        try{
            const result = await signUpNewUser(email, password);
            if (result.success){
                navigate("/");
            }
        } catch (err){
            setError("an Error Occurred" + err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
                <form onSubmit={handleSignUp}>
                <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder='Email' />
                <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder='Password' />
                <button type="submit" disabled={loading}>Sign up</button> <br />
            </form>
            <Link to="/">Back to start</Link>
            {error && <p>{error}</p>}
        </>
    );
};

export default SignupForm;