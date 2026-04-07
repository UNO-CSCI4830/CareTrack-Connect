import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import ProfileService from "../../services/profileService";

const SignupForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    
    const handleSignUp = async (e) => { 
        e.preventDefault();
        setError("");

        if (!role) {
            setError("Please select a role.");
            return;
        }

        setLoading(true);
        try {
            await ProfileService.createProfile({
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                role,
            });
            navigate(role === "patient" ? "/patient" : "/doctor");
        } catch (err) {
            setError("An error occurred: " + (err?.message || err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSignUp}>
                <input
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    required
                />
                <input
                    onChange={(e) => setLastName(e.target.value)}
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    required
                />
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Email"
                    value={email}
                    required
                />
                <input
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Password"
                    value={password}
                    required
                />
                <label htmlFor="role">I am signing up as:</label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                >
                    <option value="">Select a role</option>
                    <option value="patient">Patient</option>
                    <option value="provider">Doctor</option>
                </select>
                <button type="submit" disabled={loading}>Sign up</button>
            </form>
            <Link to="/">Back to start</Link>
            {error && <p>{error}</p>}
        </>
    );
};

export default SignupForm;
