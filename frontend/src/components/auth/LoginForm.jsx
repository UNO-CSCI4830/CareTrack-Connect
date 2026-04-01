import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from "./AuthContext";
import ProfileService from "../../services/profileService";

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
        setError("");
        try {
            const result = await loginUser(email, password);
            if (!result.success) {
                setError(result.error?.message || "Login failed");
                return;
            }

            const userId = result.data?.user?.id;
            if (!userId) {
                setError("Unable to retrieve logged in user ID");
                return;
            }

            const profileResponse = await ProfileService.getProfileByAuthUserId(userId);
            const profile = profileResponse?.data;
            const role = profile?.role;

            if (role === "provider") {
                navigate("/doctor");
            } else if (role === "patient") {
                navigate("/patient");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError("An error occurred: " + (err?.message || err));
        } finally {
            setLoading(false);
        }
    };

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