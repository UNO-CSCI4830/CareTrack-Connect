import './App.css';
import { Link } from 'react-router-dom';


//routing imports
function App() {
  
  return (
    <>
      <section id="center">
       <h1>Hello Care</h1>
        <Link to="/signup">Sign up here</Link>
        <Link to="/login">Log in here</Link>
        <Link to="/doctor"> Doctor's View Demo</Link>
        <Link to="/patient"> Patients's View Demo</Link>
      </section>

    </>
  )
}

export default App
