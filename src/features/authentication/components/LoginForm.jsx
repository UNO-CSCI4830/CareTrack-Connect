import React, { useState } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserAuth } from "./AuthContext";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("");
    const {session, loginUser } = UserAuth();
    const navigate = useNavigate()
    
    const handleLogin = async (e) => { 
        e.preventDefault();
        setLoading(true);
        try{
            const result = await loginUser(email, password);
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
            <form onSubmit={handleLogin}>
                <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder='Email' /><br />
                <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder='Password' /> <br />
                <button type="submit" disabled={loading}>Log in</button> <br />
            </form>
            <Link to="/">Back to start</Link>
            {error && <p>{error}</p>}
        </>
    );
};

export default LoginForm;