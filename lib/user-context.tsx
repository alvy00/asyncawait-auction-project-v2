/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import supabase from "../lib/supabasebrowserClient";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "../lib/interfaces";
import { useAuth } from "./auth-context";

interface UserContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    supabaseUser: SupabaseUser | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    refetchIndex: number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { isReady } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refetchIndex, setRefetchIndex] = useState(0);

    const refreshUser = useCallback(async () => {
        if (!isReady) return;
        setIsLoading(true);
        try {
            const { data: sessionData, error } =
                await supabase.auth.getSession();
            const session = sessionData?.session;

            if (error) {
                //console.warn("🔒 Supabase session error:", error.message);
                setUser(null);
                setSupabaseUser(null);
                return;
            }

            if (!session || !session.access_token || !session.user) {
                //console.warn("🔒 No valid session found.");
                setUser(null);
                setSupabaseUser(null);
                return;
            }

            setSupabaseUser(session.user);

            // Updated to fetch directly from your local unified route handler
            const response = await fetch("/api/users", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                //console.error("❌ Error fetching app user:", errorText);
                setUser(null);
            } else {
                const userData = await response.json();
                setUser(userData);
                //console.log("✅ App user loaded:", userData);
            }
        } catch (err) {
            //console.error("❌ Failed to fetch app user:", err);
            setUser(null);
        } finally {
            setIsLoading(false);
            setRefetchIndex((i) => i + 1);
        }
    }, [isReady]);

    useEffect(() => {
        if (!isReady) return;

        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                //console.log("🔄 Auth state changed (UserProvider):", event);

                if (session?.access_token && session.user) {
                    setSupabaseUser(session.user);
                    refreshUser();
                } else {
                    setSupabaseUser(null);
                    setUser(null);
                    setIsLoading(false);
                    setRefetchIndex((i) => i + 1);
                }
            },
        );

        return () => {
            listener?.subscription?.unsubscribe();
        };
    }, [refreshUser, isReady]);

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                supabaseUser,
                isLoading,
                refreshUser,
                refetchIndex,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};
