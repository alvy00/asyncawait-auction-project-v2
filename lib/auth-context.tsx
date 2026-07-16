/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import supabase from "../lib/supabasebrowserClient";

type AuthContextType = {
    loggedIn: boolean;
    login: (
        email: string,
        password: string,
        remember: boolean,
    ) => Promise<void>;
    logout: (reason?: "manual" | "expired") => Promise<void>;
    token?: string; // Still exposed for your API calls
    user?: any;
    refreshUserSignal: number;
    refreshUser: () => void;
    isReady: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [token, setToken] = useState<string | undefined>();
    const [user, setUser] = useState<any | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [refreshUserSignal, setRefreshUserSignal] = useState(0);
    const router = useRouter();

    const refreshUser = useCallback(() => {
        setRefreshUserSignal((count) => count + 1);
    }, []);

    const logout = async (reason: "manual" | "expired" = "manual") => {
        await supabase.auth.signOut();
        // State cleanup happens automatically via onAuthStateChange
        if (reason === "expired") {
            toast.error("Session expired. Please log in again.");
        }
        localStorage.setItem("authChange", Date.now().toString());
        router.replace("/login");
    };

    const login = async (
        email: string,
        password: string,
        remember: boolean,
    ) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw new Error(error.message);
    };

    // Unified Auth Observer
    useEffect(() => {
        // 1. Initial Session Check
        const init = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                setToken(data.session.access_token);
                setUser(data.session.user);
                setLoggedIn(true);
            }
            setIsReady(true);
        };
        init();

        // 2. Auth State Listener (Handles login, logout, and token refreshes)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setToken(session?.access_token || undefined);
            setUser(session?.user || null);
            setLoggedIn(!!session);
            refreshUser();
        });

        return () => subscription.unsubscribe();
    }, [refreshUser]);

    // Cross-tab logout sync
    useEffect(() => {
        const syncLogout = (e: StorageEvent) => {
            if (e.key === "authChange") window.location.reload();
        };
        window.addEventListener("storage", syncLogout);
        return () => window.removeEventListener("storage", syncLogout);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                loggedIn,
                login,
                logout,
                token,
                user,
                refreshUserSignal,
                refreshUser,
                isReady,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
