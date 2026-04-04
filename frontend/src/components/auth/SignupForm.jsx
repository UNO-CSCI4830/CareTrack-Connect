import React, { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { UserAuth } from "./AuthContext";

const SignupForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("");
    const {session, signUpNewUser } = UserAuth();
    const { role } = useParams();

    const navigate = useNavigate()
    
    const handleSignUp = async (e) => { 
        e.preventDefault();
        setLoading(true);
        try{
            const result = await signUpNewUser(email, password, role);
            if (result.success){
                navigate("/logoutTest");
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
                <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder='Email' /><br />
                <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder='Password' /> <br />
                <button type="submit" disabled={loading}>Sign up</button> <br />
            </form>
            <Link to="/">Back to start</Link>
            {error && <p>{error}</p>}
        </>
    );
};

export default SignupForm;