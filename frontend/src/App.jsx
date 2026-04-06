import './App.css';
import { Link } from 'react-router-dom';

/*
       <h1>Hello Care</h1>
        <Link to="/signup">Sign up here</Link>
        <Link to="/login">Log in here</Link>
        <Link to="/doctor"> Doctor's View Demo</Link>
        <Link to="/patient"> Patients's View Demo</Link>
        <Link to="/signup/patient">Sign up here (patient) </Link>
        <Link to="/signup/doctor">Sign up here (doctor)</Link>
        */

//routing imports
function App() {
  
  return (
    <>
    <div id="center" className="card">
    <h1>CareTrack Connect</h1>
        <Link to="/signup">Sign up here</Link>
        <Link to="/login">Log in here</Link>
        <Link to="/doctor"> Doctor's View Demo</Link>
        <Link to="/patient"> Patients's View Demo</Link>
        <Link to="/signup/patient">Sign up here (patient) </Link>
        <Link to="/signup/doctor">Sign up here (doctor)</Link>
    </div>
    </>
  )
}

export default App
