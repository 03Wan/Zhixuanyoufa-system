export type AuthUser = {
    id?: string;
    username?: string;
    name?: string;
    email?: string;
    companyName?: string;
    role?: string;
};
export declare function useAuthStore(): {
    state: {
        token: string;
        user: {
            id?: string | undefined;
            username?: string | undefined;
            name?: string | undefined;
            email?: string | undefined;
            companyName?: string | undefined;
            role?: string | undefined;
        } | null;
    };
    isLoggedIn: import("vue").ComputedRef<boolean>;
    setAuth: (token: string, user: AuthUser | null) => void;
    logout: () => void;
    syncFromStorage: () => void;
};
