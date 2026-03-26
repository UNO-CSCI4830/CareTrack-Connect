import {createContext, useState, useContext, useEffect} from "react";
import { supabase } from "../../../api/supabaseClient";

const AuthContext = createContext();

//the login and sign out should be children of this
//I've only done the sign up -CD
export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);

    //sign up
    const signUpNewUser = async (email, password) => {
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if(error){
            console.error("Error signing up:", error);
            return {success: false, error}
        }
        return {success: true, data};
    };
    
    useEffect(() =>{
        supabase.auth.getSession().then(({data: {session}}) => {
        setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);
    

    return (
        <AuthContext.Provider value={{session, signUpNewUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
}