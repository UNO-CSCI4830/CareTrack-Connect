import React from "react";
import {Link, NavLink} from 'react-router-dom'


import styles from "../styles/navigationBar.module.css" // Optional: for styling

const NavigationBar = () =>{
    return(
        <nav className={styles.navbar}>
            <div className={styles.navbarBrand}>
                <Link to="/">Logout</Link>
            </div>
            <ul className={styles.navLinks}>
                <li>
                    <NavLink>Dashboard</NavLink>
                </li>
                <li>
                    <NavLink>Weekly Report</NavLink>
                </li>
                <li>
                    <NavLink>History</NavLink>
                </li>
            </ul>
        </nav>
    )
}

export default NavigationBar;


