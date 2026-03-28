import React, { useState } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserAuth } from "./AuthContext";


export const LogoutButton = () => {
    const {logout} = UserAuth();
    const navigate = useNavigate();

    const handleLogOut = async () => {

        navigate("/");
    }

    return(
        <button onClick={handleLogOut}> Logout </button>

    );

};