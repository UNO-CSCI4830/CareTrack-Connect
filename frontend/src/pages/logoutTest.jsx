import React from "react";
import { UserAuth } from "../components/auth/AuthContext";
import { LogoutButton } from "../components/auth/LogoutButton";
import { supabase } from "../api/supabaseClient";
const { data: { user } } = await supabase.auth.getUser();



const LogoutTest = () => {
    return (
        <section id="center">
            <LogoutButton />
        </section>
    );
};

export default LogoutTest;