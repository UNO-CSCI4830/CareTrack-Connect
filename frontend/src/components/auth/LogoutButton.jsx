import React, { useState } from "react";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { UserAuth } from "./AuthContext";
import { supabase } from "../../api/supabaseClient";
export const LogoutButton = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("");
    
    const {logoutUser} = UserAuth();
    const navigate = useNavigate();


 


    const handleLogOut = async (e) => {
        let { data: { user } } = await supabase.auth.getUser();

        console.log(user);
        e.preventDefault();

        setLoading(true);
        try{
            const result = await logoutUser();
            if (result.success){
                navigate("/");

            }
        } catch (err){
            setError("an Error Occurred" + err);
        } finally {
            setLoading(false);
            user = await supabase.auth.getUser();

            console.log(user);

        }
    
        

        navigate("/");


    }

    return(
        <Link onClick={handleLogOut}> Logout </Link>

    );

};