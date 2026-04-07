import SignupForm from "../components/auth/SignupForm";

const Signup = () => {
    return (
        <section id="center">
            <div className="auth-card">
                <h1>Sign Up</h1>
                <p className="auth-subtext">Create your account and choose your role below.</p>
                <SignupForm />
            </div>
        </section>
    );
};

export default Signup;
