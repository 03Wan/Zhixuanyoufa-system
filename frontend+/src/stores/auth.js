import { computed, reactive } from "vue";
import { clearToken, getToken, getUserProfile, setToken, setUserProfile } from "@/lib/api";
import { appendAuditLog } from "@/lib/audit-log";
const state = reactive({
    token: getToken(),
    user: (getUserProfile() || null),
});
export function useAuthStore() {
    const isLoggedIn = computed(() => !!state.token);
    function setAuth(token, user) {
        setToken(token);
        if (user)
            setUserProfile(user);
        state.token = token;
        state.user = user;
    }
    function logout() {
        appendAuditLog({ actionType: "用户退出", target: state.user?.email || state.user?.username || "当前用户" });
        clearToken();
        state.token = "";
        state.user = null;
    }
    function syncFromStorage() {
        state.token = getToken();
        state.user = getUserProfile();
    }
    return { state, isLoggedIn, setAuth, logout, syncFromStorage };
}
