import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';
import { Link } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';

//routing imports
function App() {
  
  return (
    <>
      <section id="center">
       <h1>Hello Care</h1>
       <Link to="/signup/patient">Sign up here (patient) </Link>
       <Link to="/signup/doctor">Sign up here (doctor)</Link>
       <Link to="/login">Log in here</Link>
       <Link to="signup">Sign up here</Link>
       <Link to="doctorView"> Doctor's View Demo</Link>
       <Link to="PatientView"> Patients's View Demo</Link>
      </section>

    </>
  )
}

export default App
