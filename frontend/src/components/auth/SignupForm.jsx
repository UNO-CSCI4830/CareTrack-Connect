import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import ProfileService from "../../services/profileService";

const SignupForm = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("patient");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleSignUp = async (e) => { 
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const data = await ProfileService.createProfile({
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: password,
                role: role,
            });

            const profile = data?.data?.profile;
            const newRole = profile?.role || role;

            if (newRole === 'provider') {
                navigate('/doctor');
            } else if (newRole === 'patient') {
                navigate('/patient');
            } else {
                navigate('/login');
            }
        } catch (err) {
            setError("An error occurred: " + err.message);
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
                    placeholder='First Name' 
                    value={firstName}
                    required
                /><br />
                <input 
                    onChange={(e) => setLastName(e.target.value)} 
                    type="text" 
                    placeholder='Last Name' 
                    value={lastName}
                    required
                /><br />
                <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    type="email" 
                    placeholder='Email' 
                    value={email}
                    required
                /><br />
                <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    type="password" 
                    placeholder='Password' 
                    value={password}
                    required
                /><br />
                <select 
                    onChange={(e) => setRole(e.target.value)} 
                    value={role}
                >
                    <option value="patient">Patient</option>
                    <option value="provider">Doctor</option>
                </select><br />
                <button type="submit" disabled={loading}>
                    {loading ? "Signing up..." : "Sign up"}
                </button><br />
            </form>
            <Link to="/">Back to start</Link>
            {error && <p style={{color: 'red'}}>{error}</p>}
        </>
    );
};

export default SignupForm;