import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';
import { Link } from 'react-router-dom';

//routing imports
function App() {
  
  return (
    <>
      <section id="center">
       <h1>Hello Care</h1>
       <Link to="/signup">Sign up here</Link>
      </section>

    </>
  )
}

export default App
