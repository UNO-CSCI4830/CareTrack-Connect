import {createContext, useState, useContext, useEffect, useRef, useCallback} from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../../api/supabaseClient";
import SessionTimeoutWarning from "./SessionTimeoutWarning";
import ProfileService from "../../services/profileService";
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined);
    const [profile, setProfile] = useState(null);
    const sessionRef = useRef(null);
    const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 min timer. Use `30 * 1000` for 30 second testing
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
    const warningShownRef = useRef(false);
    const WARNING_BEFORE = 2 * 60 * 1000; // 2 min warning. Use `10 * 1000` for 10 second testing

    //sign out
    const logoutUser = async () => {
        const {error} = await supabase.auth.signOut();
        if (error){
            console.error("Error logging out: ", error);
            return {success: false, error};
        }
        return {success: true};
    }

    // Activity Timer
    const resetTimer = useCallback(() => {
        if (warningShownRef.current) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (warningRef.current) {
            clearTimeout(warningRef.current);
        }
        setShowTimeoutWarning(false);

        if (sessionRef.current) {
            warningRef.current = setTimeout(() => {
                warningShownRef.current = true;
                setShowTimeoutWarning(true);
            }, TIMEOUT_DURATION - WARNING_BEFORE);

            timeoutRef.current = setTimeout(async () => {
                warningShownRef.current = false;
                setShowTimeoutWarning(false);
                await logoutUser();
                window.location.href = "/";
            }, TIMEOUT_DURATION);
        }
    }, []);

    useEffect(() => {
        if (session) {
            const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

            events.forEach((event) => {
                window.addEventListener(event, resetTimer);
            });

            resetTimer();

            return () => {
                events.forEach((event) => {
                    window.removeEventListener(event, resetTimer);
                });
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                if (warningRef.current) {
                    clearTimeout(warningRef.current);
                }
            };
        }
    }, [session]);

    const extendSession = () => {
        warningShownRef.current = false;
        setShowTimeoutWarning(false);
        resetTimer();
    }

    //sign up
    const signUpNewUser = async (email, password, roleType, firstName, lastName) => {
        const {data, error} = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data:{
                    role: roleType,
                    first_name: firstName,
                    last_name: lastName
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

    const fetchProfile = async (authUserId) => {
        try {
            const result = await ProfileService.getProfileByAuthUserId(authUserId);
            const profileData = result.data ?? result;
            setProfile(profileData);
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setProfile(null);
        }
    };

    useEffect(() =>{
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
            sessionRef.current = session;
            if (session?.user?.id) {
                fetchProfile(session.user.id);
            }
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            sessionRef.current = session;
            if (session?.user?.id) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });
    }, []);

    return (
        <AuthContext.Provider value={{session, profile, signUpNewUser, loginUser, logoutUser, showTimeoutWarning, extendSession}}>
        {showTimeoutWarning && <SessionTimeoutWarning />}
        {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext);
}
