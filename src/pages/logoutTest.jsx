import React from "react";
import { UserAuth } from "../features/authentication/components/AuthContext";
import { LogoutButton } from "../features/authentication/components/LogoutButton";
const LogoutTest = () => {
    return (
        <section id="center">
            <LogoutButton />
        </section>
    );
};

export default LogoutTest;