import './App.css';
import { Link } from 'react-router-dom';


function App() {
  
  return (
    <>
    <div id="center" className="card">
    <h1>CareTrack Connect</h1>
        <Link to="/signup">Sign up here</Link>
        <Link to="/login">Log in here</Link>
        <Link to="/doctor"> Doctor's View Demo</Link>
        <Link to="/patient"> Patients's View Demo</Link>
    </div>
    </>
  )
}

export default App
