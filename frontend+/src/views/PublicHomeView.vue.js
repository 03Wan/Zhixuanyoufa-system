import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Archive, Globe, LogIn, MessageCircleQuestion, ScanSearch, Sparkles, Store, FileSearch, ShieldAlert, WandSparkles, FileCheck2, Upload, Bot, UserCheck, FolderArchive, CircleHelp, } from 'lucide-vue-next';
import ThemeToggle from '@/components/ThemeToggle.vue';
import { api, getFriendlyError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { normalizeRole, ROLE_LABELS } from '@/lib/permissions';
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const authModalOpen = ref(false);
const authMode = ref('login');
const loading = ref(false);
const authError = ref('');
const loginForm = reactive({ email: '', password: '' });
const registerForm = reactive({ companyName: '', username: '', email: '', password: '' });
const confirmPassword = ref('');
const comingSoon = reactive({ open: false, message: '' });
const selectedRole = ref('OPERATOR');
const roleOptions = Object.keys(ROLE_LABELS).map((role) => ({ value: role, label: ROLE_LABELS[role] }));
watch(() => route.query.auth, () => {
    const auth = String(route.query.auth || '').toLowerCase();
    authModalOpen.value = auth === 'login' || auth === 'register';
    if (authModalOpen.value)
        authMode.value = 'login';
}, { immediate: true });
function openAuth(mode) {
    router.replace({ path: '/home-public', query: { ...route.query, auth: mode } });
}
function closeAuth() {
    const query = { ...route.query };
    delete query.auth;
    router.replace({ path: '/home-public', query });
}
function switchMode(mode) {
    authError.value = '';
    openAuth(mode);
}
function useDemoAccount() {
    loginForm.email = 'sysadmin@example.com';
    loginForm.password = '123456';
}
function openRegisterComingSoon() {
    comingSoon.message = '功能暂未开放，敬请期待~';
    comingSoon.open = true;
}
function validateRegister() {
    if (!registerForm.companyName.trim() || !registerForm.username.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
        authError.value = '请完整填写注册信息。';
        return false;
    }
    if (registerForm.password.length < 6) {
        authError.value = '密码长度不能少于 6 位。';
        return false;
    }
    if (registerForm.password !== confirmPassword.value) {
        authError.value = '两次输入的密码不一致。';
        return false;
    }
    return true;
}
async function submitLogin() {
    loading.value = true;
    authError.value = '';
    try {
        await api.login(loginForm);
        authStore.syncFromStorage();
        const currentRole = normalizeRole(authStore.state.user?.role);
        if (currentRole !== selectedRole.value) {
            authStore.logout();
            authError.value = `无权限：当前账号角色为「${ROLE_LABELS[currentRole]}」，你选择的是「${ROLE_LABELS[selectedRole.value]}」。`;
            return;
        }
        const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/home';
        router.push(redirect);
    }
    catch (error) {
        authError.value = getFriendlyError(error);
    }
    finally {
        loading.value = false;
    }
}
async function submitRegister() {
    if (!validateRegister())
        return;
    loading.value = true;
    authError.value = '';
    try {
        await api.register(registerForm);
        switchMode('login');
        loginForm.email = registerForm.email;
        loginForm.password = '';
    }
    catch (error) {
        authError.value = getFriendlyError(error);
    }
    finally {
        loading.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-section']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['steps']} */ ;
/** @type {__VLS_StyleScopedClasses['chip-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['two-col']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['step']} */ ;
/** @type {__VLS_StyleScopedClasses['step']} */ ;
/** @type {__VLS_StyleScopedClasses['step']} */ ;
/** @type {__VLS_StyleScopedClasses['chip']} */ ;
/** @type {__VLS_StyleScopedClasses['faq-list']} */ ;
/** @type {__VLS_StyleScopedClasses['faq']} */ ;
/** @type {__VLS_StyleScopedClasses['faq']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-line']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['dark']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['dark']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['dark']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-modal-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['two-col']} */ ;
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['steps']} */ ;
/** @type {__VLS_StyleScopedClasses['chip-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['faq-list']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step']} */ ;
/** @type {__VLS_StyleScopedClasses['step']} */ ;
/** @type {__VLS_StyleScopedClasses['faq']} */ ;
/** @type {__VLS_StyleScopedClasses['faq']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-mini']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "public-home" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "public-bg" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "landing" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "nav glass" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav-actions" },
});
/** @type {[typeof ThemeToggle, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(ThemeToggle, new ThemeToggle({}));
const __VLS_1 = __VLS_0({}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.openAuth('login');
        } },
    type: "button",
    ...{ class: "btn btn-primary icon-btn" },
});
const __VLS_3 = {}.LogIn;
/** @type {[typeof __VLS_components.LogIn, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(__VLS_3, new __VLS_3({
    size: (18),
    'aria-hidden': "true",
}));
const __VLS_5 = __VLS_4({
    size: (18),
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "hero glass" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "eyebrow" },
});
const __VLS_7 = {}.Sparkles;
/** @type {[typeof __VLS_components.Sparkles, ]} */ ;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
    ...{ class: "title-icon" },
    'aria-hidden': "true",
}));
const __VLS_9 = __VLS_8({
    ...{ class: "title-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "sub" },
});
/** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
    as: "section",
    ...{ class: "main-panel" },
    radius: (28),
}));
const __VLS_12 = __VLS_11({
    as: "section",
    ...{ class: "main-panel" },
    radius: (28),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_13.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "panel-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
const __VLS_14 = {}.ScanSearch;
/** @type {[typeof __VLS_components.ScanSearch, ]} */ ;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent(__VLS_14, new __VLS_14({
    ...{ class: "card-icon" },
    'aria-hidden': "true",
}));
const __VLS_16 = __VLS_15({
    ...{ class: "card-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "plain-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item-head" },
});
const __VLS_18 = {}.FileSearch;
/** @type {[typeof __VLS_components.FileSearch, ]} */ ;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_20 = __VLS_19({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "plain-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item-head" },
});
const __VLS_22 = {}.ShieldAlert;
/** @type {[typeof __VLS_components.ShieldAlert, ]} */ ;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_24 = __VLS_23({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "plain-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item-head" },
});
const __VLS_26 = {}.WandSparkles;
/** @type {[typeof __VLS_components.WandSparkles, ]} */ ;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent(__VLS_26, new __VLS_26({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_28 = __VLS_27({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
    ...{ class: "plain-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "item-head" },
});
const __VLS_30 = {}.FileCheck2;
/** @type {[typeof __VLS_components.FileCheck2, ]} */ ;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent(__VLS_30, new __VLS_30({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_32 = __VLS_31({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
__VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "panel-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
const __VLS_34 = {}.Archive;
/** @type {[typeof __VLS_components.Archive, ]} */ ;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent(__VLS_34, new __VLS_34({
    ...{ class: "card-icon" },
    'aria-hidden': "true",
}));
const __VLS_36 = __VLS_35({
    ...{ class: "card-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "steps" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-head" },
});
const __VLS_38 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent(__VLS_38, new __VLS_38({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_40 = __VLS_39({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-head" },
});
const __VLS_42 = {}.Bot;
/** @type {[typeof __VLS_components.Bot, ]} */ ;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent(__VLS_42, new __VLS_42({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_44 = __VLS_43({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-head" },
});
const __VLS_46 = {}.UserCheck;
/** @type {[typeof __VLS_components.UserCheck, ]} */ ;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent(__VLS_46, new __VLS_46({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_48 = __VLS_47({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-head" },
});
const __VLS_50 = {}.FolderArchive;
/** @type {[typeof __VLS_components.FolderArchive, ]} */ ;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent(__VLS_50, new __VLS_50({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_52 = __VLS_51({
    size: (16),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "panel-section two-col" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
const __VLS_54 = {}.Store;
/** @type {[typeof __VLS_components.Store, ]} */ ;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent(__VLS_54, new __VLS_54({
    ...{ class: "card-icon" },
    'aria-hidden': "true",
}));
const __VLS_56 = __VLS_55({
    ...{ class: "card-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "platform-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "chip-wrap" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "chip" },
});
const __VLS_58 = {}.Globe;
/** @type {[typeof __VLS_components.Globe, ]} */ ;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent(__VLS_58, new __VLS_58({
    size: (14),
    'aria-hidden': "true",
}));
const __VLS_60 = __VLS_59({
    size: (14),
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "chip" },
});
const __VLS_62 = {}.Globe;
/** @type {[typeof __VLS_components.Globe, ]} */ ;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent(__VLS_62, new __VLS_62({
    size: (14),
    'aria-hidden': "true",
}));
const __VLS_64 = __VLS_63({
    size: (14),
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "chip" },
});
const __VLS_66 = {}.Globe;
/** @type {[typeof __VLS_components.Globe, ]} */ ;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent(__VLS_66, new __VLS_66({
    size: (14),
    'aria-hidden': "true",
}));
const __VLS_68 = __VLS_67({
    size: (14),
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "chip" },
});
const __VLS_70 = {}.Globe;
/** @type {[typeof __VLS_components.Globe, ]} */ ;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent(__VLS_70, new __VLS_70({
    size: (14),
    'aria-hidden': "true",
}));
const __VLS_72 = __VLS_71({
    size: (14),
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "panel-section" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "section-title" },
});
const __VLS_74 = {}.MessageCircleQuestion;
/** @type {[typeof __VLS_components.MessageCircleQuestion, ]} */ ;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent(__VLS_74, new __VLS_74({
    ...{ class: "card-icon" },
    'aria-hidden': "true",
}));
const __VLS_76 = __VLS_75({
    ...{ class: "card-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "faq-list faq" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
const __VLS_78 = {}.CircleHelp;
/** @type {[typeof __VLS_components.CircleHelp, ]} */ ;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent(__VLS_78, new __VLS_78({
    size: (14),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_80 = __VLS_79({
    size: (14),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
const __VLS_82 = {}.CircleHelp;
/** @type {[typeof __VLS_components.CircleHelp, ]} */ ;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent(__VLS_82, new __VLS_82({
    size: (14),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_84 = __VLS_83({
    size: (14),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({});
const __VLS_86 = {}.CircleHelp;
/** @type {[typeof __VLS_components.CircleHelp, ]} */ ;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent(__VLS_86, new __VLS_86({
    size: (14),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}));
const __VLS_88 = __VLS_87({
    size: (14),
    ...{ class: "mini-icon" },
    'aria-hidden': "true",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.footer, __VLS_intrinsicElements.footer)({
    ...{ class: "panel-footer" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "footer-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "footer-contact" },
});
var __VLS_13;
if (__VLS_ctx.authModalOpen) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeAuth) },
        ...{ class: "auth-modal-mask" },
    });
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "auth-modal fade-up" },
        radius: (24),
        role: "dialog",
        'aria-modal': "true",
    }));
    const __VLS_91 = __VLS_90({
        as: "section",
        ...{ class: "auth-modal fade-up" },
        radius: (24),
        role: "dialog",
        'aria-modal': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    __VLS_92.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "auth-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "brand-mini" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "logo" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeAuth) },
        type: "button",
        ...{ class: "btn btn-secondary" },
    });
    if (__VLS_ctx.authMode === 'login') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "auth-sub" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
            ...{ onSubmit: (__VLS_ctx.submitLogin) },
            ...{ class: "form-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            placeholder: "邮箱",
        });
        (__VLS_ctx.loginForm.email);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            type: "password",
            placeholder: "密码",
        });
        (__VLS_ctx.loginForm.password);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            ...{ class: "input" },
            value: (__VLS_ctx.selectedRole),
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.roleOptions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: (item.value),
                value: (item.value),
            });
            (item.label);
        }
        if (__VLS_ctx.authError) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "err" },
            });
            (__VLS_ctx.authError);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ class: "btn btn-primary submit-btn" },
            disabled: (__VLS_ctx.loading),
        });
        (__VLS_ctx.loading ? '登录中...' : '确认登录');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.useDemoAccount) },
            ...{ class: "btn btn-secondary" },
            type: "button",
            disabled: (__VLS_ctx.loading),
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "switch-line" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.openRegisterComingSoon) },
            ...{ class: "link-btn" },
            type: "button",
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "auth-sub" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.form, __VLS_intrinsicElements.form)({
            ...{ onSubmit: (__VLS_ctx.submitRegister) },
            ...{ class: "form-grid" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            placeholder: "企业名称",
        });
        (__VLS_ctx.registerForm.companyName);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            placeholder: "用户姓名",
        });
        (__VLS_ctx.registerForm.username);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            placeholder: "邮箱",
        });
        (__VLS_ctx.registerForm.email);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            type: "password",
            placeholder: "密码（至少 6 位）",
        });
        (__VLS_ctx.registerForm.password);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
            ...{ class: "input" },
            type: "password",
            placeholder: "确认密码",
        });
        (__VLS_ctx.confirmPassword);
        if (__VLS_ctx.authError) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
                ...{ class: "err" },
            });
            (__VLS_ctx.authError);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ class: "btn btn-primary submit-btn" },
            disabled: (__VLS_ctx.loading),
        });
        (__VLS_ctx.loading ? '注册中...' : '确认注册');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "switch-line" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.authModalOpen))
                        return;
                    if (!!(__VLS_ctx.authMode === 'login'))
                        return;
                    __VLS_ctx.switchMode('login');
                } },
            ...{ class: "link-btn" },
            type: "button",
        });
    }
    var __VLS_92;
}
if (__VLS_ctx.comingSoon.open) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.comingSoon.open))
                    return;
                __VLS_ctx.comingSoon.open = false;
            } },
        ...{ class: "auth-modal-mask" },
    });
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "auth-modal fade-up" },
        radius: (24),
        role: "dialog",
        'aria-modal': "true",
    }));
    const __VLS_94 = __VLS_93({
        as: "section",
        ...{ class: "auth-modal fade-up" },
        radius: (24),
        role: "dialog",
        'aria-modal': "true",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "auth-sub" },
    });
    (__VLS_ctx.comingSoon.message);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.comingSoon.open))
                    return;
                __VLS_ctx.comingSoon.open = false;
            } },
        ...{ class: "btn btn-primary submit-btn" },
    });
    var __VLS_95;
}
/** @type {__VLS_StyleScopedClasses['public-home']} */ ;
/** @type {__VLS_StyleScopedClasses['public-bg']} */ ;
/** @type {__VLS_StyleScopedClasses['landing']} */ ;
/** @type {__VLS_StyleScopedClasses['nav']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['icon-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['glass']} */ ;
/** @type {__VLS_StyleScopedClasses['eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['title-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['main-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['plain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['item-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['steps']} */ ;
/** @type {__VLS_StyleScopedClasses['step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['step']} */ ;
/** @type {__VLS_StyleScopedClasses['step-head']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-section']} */ ;
/** @type {__VLS_StyleScopedClasses['two-col']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['platform-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['chip-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['chip']} */ ;
/** @type {__VLS_StyleScopedClasses['chip']} */ ;
/** @type {__VLS_StyleScopedClasses['chip']} */ ;
/** @type {__VLS_StyleScopedClasses['chip']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['card-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['faq-list']} */ ;
/** @type {__VLS_StyleScopedClasses['faq']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['mini-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-main']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-contact']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-modal-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-head']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-mini']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['err']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-line']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['err']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-line']} */ ;
/** @type {__VLS_StyleScopedClasses['link-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-modal-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-sub']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            Archive: Archive,
            Globe: Globe,
            LogIn: LogIn,
            MessageCircleQuestion: MessageCircleQuestion,
            ScanSearch: ScanSearch,
            Sparkles: Sparkles,
            Store: Store,
            FileSearch: FileSearch,
            ShieldAlert: ShieldAlert,
            WandSparkles: WandSparkles,
            FileCheck2: FileCheck2,
            Upload: Upload,
            Bot: Bot,
            UserCheck: UserCheck,
            FolderArchive: FolderArchive,
            CircleHelp: CircleHelp,
            ThemeToggle: ThemeToggle,
            authModalOpen: authModalOpen,
            authMode: authMode,
            loading: loading,
            authError: authError,
            loginForm: loginForm,
            registerForm: registerForm,
            confirmPassword: confirmPassword,
            comingSoon: comingSoon,
            selectedRole: selectedRole,
            roleOptions: roleOptions,
            openAuth: openAuth,
            closeAuth: closeAuth,
            switchMode: switchMode,
            useDemoAccount: useDemoAccount,
            openRegisterComingSoon: openRegisterComingSoon,
            submitLogin: submitLogin,
            submitRegister: submitRegister,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
