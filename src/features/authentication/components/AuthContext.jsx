import {createContext, useState, useContext, useEffect} from "react";
import { supabase } from "../../../api/supabaseClient";

const AuthContext = createContext();

//the login and sign out should be children of this
//I've only done the sign up -CD
export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);

    
    
    //sign up
    const signUpNewUser = async (email, password, roleType) => {
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data:{
                    role: roleType
                }
            },
        });

        if(error){
            console.error("Error signing up:", error);
            return {success: false, error};
        }
        return {success: true, data};
    };
    
    //sign in
    const loginUser = async (email, password) => {
        const {data, error} = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if(error){
            console.error("Error logging in:", error);
            return {success: false, error};
        }
        return {success: true, data};
    }

    //sign out
    const logoutUser = async () => {
        const {error} = await supabase.auth.signOut();
        if (error){
            console.error("Error logging out: ", error);
            return {success: false, error};
        }
        return {success: true, data,};
    }
    
    
    useEffect(() =>{
        supabase.auth.getSession().then(({data: {session}}) => {
        setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
    }, []);
    

    return (
        <AuthContext.Provider value={{session, signUpNewUser, loginUser, logoutUser}}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
}