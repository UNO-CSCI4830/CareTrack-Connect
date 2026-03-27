import React from 'react';
import { Link } from 'react-router-dom';

const SignupForm = () => {
    return (
        <>
            <form>
                <input type="email" placeholder='Email' />
                <input type="password" placeholder='Password' />
                <button type="submit" disabled>Sign up</button> <br />
                <Link to="/">Back to start</Link>
            </form>
        </>
    );
};

export default SignupForm;