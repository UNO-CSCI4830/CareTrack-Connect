import LoginForm from "../components/auth/LoginForm";

const Login = () => {
  return (
    <section id="center">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtext">Log in to access your CareTrack account.</p>
        <LoginForm />
      </div>
    </section>
  );
};

export default Login;
