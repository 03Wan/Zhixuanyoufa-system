import { ref } from "vue";
const THEME_KEY = "theme";
const dark = ref(false);
export function useTheme() {
    const apply = (nextDark) => {
        dark.value = nextDark;
        document.documentElement.classList.toggle("dark", nextDark);
        localStorage.setItem(THEME_KEY, nextDark ? "dark" : "light");
    };
    const initTheme = () => {
        const saved = localStorage.getItem(THEME_KEY);
        apply(saved === "dark");
    };
    const toggleTheme = () => apply(!dark.value);
    return { dark, initTheme, toggleTheme };
}
