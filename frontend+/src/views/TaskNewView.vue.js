import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppShell from '@/layouts/AppShell.vue';
import { api, getFriendlyError } from '@/lib/api';
const router = useRouter();
const loading = ref(false);
const detecting = ref(false);
const detectStep = ref('');
const tip = ref('');
const errorModal = ref({ open: false, message: '' });
const taskId = ref('');
const localMainImages = ref([]);
const localSceneImages = ref([]);
const quotaInfo = ref({ quotaRemaining: 0, planName: '-' });
const platforms = [
    'Amazon',
    'TikTok Shop',
    'Shopee',
    'Lazada',
    'AliExpress',
    'eBay',
    'Walmart',
    'Etsy',
    'Temu',
    'Shein',
    'Ozon',
    'Mercado Libre',
    'Noon',
    'Daraz',
    'Facebook Shop',
    'Instagram Shop',
    'YouTube Shopping',
    '独立站',
];
const markets = ['欧美', '中东', '东南亚', '日本', '全球通用'];
const purposes = ['上架前审核', '广告投放前审核', '活动素材审核', '历史素材复审'];
const categories = [
    '衣服',
    '鞋靴',
    '箱包配饰',
    '3C数码',
    '家居家纺',
    '美妆个护',
    '母婴玩具',
    '运动户外',
    '食品保健',
    '汽车用品',
    '办公文具',
    '宠物用品',
    '其他',
];
const form = reactive({
    sku: '',
    productName: '',
    category: '',
    platform: '',
    market: '',
    purpose: '',
    title: '',
    sellingPoints: '',
    detailText: '',
    adText: '',
    videoScript: '',
    mainImageUrlsText: '',
    sceneImageUrlsText: '',
});
function validateRequired() {
    return !!(form.sku && form.productName && form.category && form.platform && form.market && form.purpose && form.title && form.sellingPoints && form.detailText);
}
function showErrorModal(message) {
    errorModal.value = { open: true, message };
}
function closeErrorModal() {
    errorModal.value = { open: false, message: '' };
}
function parseMultilineUrls(value) {
    return value
        .split('\n')
        .map((v) => v.trim())
        .filter(Boolean);
}
function filesToObjectUrls(files) {
    if (!files)
        return [];
    return Array.from(files).map((file) => URL.createObjectURL(file));
}
async function onMainImagesChange(event) {
    const input = event.target;
    const files = input.files ? Array.from(input.files) : [];
    const task = await ensureTaskSaved();
    const uploaded = await Promise.all(files.map((f) => api.uploadFile(f, task)));
    localMainImages.value = uploaded.map((x) => x.url);
    quotaInfo.value = await api.quotaCheck();
}
async function onSceneImagesChange(event) {
    const input = event.target;
    const files = input.files ? Array.from(input.files) : [];
    const task = await ensureTaskSaved();
    const uploaded = await Promise.all(files.map((f) => api.uploadFile(f, task)));
    localSceneImages.value = uploaded.map((x) => x.url);
    quotaInfo.value = await api.quotaCheck();
}
async function ensureTaskSaved() {
    if (taskId.value)
        return taskId.value;
    const mainImageUrls = [...parseMultilineUrls(form.mainImageUrlsText), ...localMainImages.value];
    const sceneImageUrls = [...parseMultilineUrls(form.sceneImageUrlsText), ...localSceneImages.value];
    const created = await api.createTask({
        sku: form.sku,
        productName: form.productName,
        category: form.category,
        platform: form.platform,
        market: form.market,
        purpose: form.purpose,
        title: form.title,
        sellingPoints: form.sellingPoints,
        detailText: form.detailText,
        adText: form.adText,
        videoScript: form.videoScript,
        mainImageUrls,
        sceneImageUrls,
        imageUrls: [...mainImageUrls, ...sceneImageUrls],
    });
    taskId.value = created.id;
    return taskId.value;
}
async function saveDraft() {
    closeErrorModal();
    tip.value = '';
    if (!validateRequired()) {
        showErrorModal('请先填写必填项');
        return;
    }
    loading.value = true;
    try {
        quotaInfo.value = await api.quotaCheck();
        const id = await ensureTaskSaved();
        const mainImageUrls = [...parseMultilineUrls(form.mainImageUrlsText), ...localMainImages.value];
        const sceneImageUrls = [...parseMultilineUrls(form.sceneImageUrlsText), ...localSceneImages.value];
        await api.saveTaskMaterials(id, {
            title: form.title,
            sellingPoints: form.sellingPoints,
            detailText: form.detailText,
            adText: form.adText,
            videoScript: form.videoScript,
            mainImageUrls,
            sceneImageUrls,
            imageUrls: [...mainImageUrls, ...sceneImageUrls],
        });
        tip.value = '草稿已保存';
    }
    catch (e) {
        showErrorModal(getFriendlyError(e));
    }
    finally {
        loading.value = false;
    }
}
async function startDetect() {
    closeErrorModal();
    tip.value = '';
    if (!validateRequired()) {
        showErrorModal('请先填写必填项');
        return;
    }
    loading.value = true;
    detecting.value = true;
    const startedAt = Date.now();
    try {
        quotaInfo.value = await api.quotaCheck();
        if ((quotaInfo.value?.quotaRemaining ?? 0) <= 0) {
            showErrorModal('当前套餐检测额度不足，请升级套餐或联系团队开通试点额度');
            return;
        }
        const id = await ensureTaskSaved();
        detectStep.value = '准备任务与素材...';
        await new Promise((r) => setTimeout(r, 700));
        detectStep.value = '调用检测引擎分析文本与图片...';
        await api.analyzeTask(id);
        detectStep.value = '整理检测结果与风险建议...';
        const elapsed = Date.now() - startedAt;
        if (elapsed < 2600) {
            await new Promise((r) => setTimeout(r, 2600 - elapsed));
        }
        await api.updateTaskStatus(id, 'COMPLETED');
        router.push(`/results?taskId=${encodeURIComponent(id)}`);
    }
    catch (e) {
        showErrorModal(getFriendlyError(e));
    }
    finally {
        detecting.value = false;
        detectStep.value = '';
        loading.value = false;
    }
}
async function submitReview() {
    closeErrorModal();
    tip.value = '';
    if (!validateRequired()) {
        showErrorModal('请先填写必填项');
        return;
    }
    loading.value = true;
    try {
        const id = await ensureTaskSaved();
        await api.requestManualReview(id, '任务中心提交人工复核');
        await api.updateTaskStatus(id, 'REVIEW_REQUIRED');
        tip.value = '已提交人工复核';
    }
    catch (e) {
        showErrorModal(getFriendlyError(e));
    }
    finally {
        loading.value = false;
    }
}
{
    api.quotaCheck().then((q) => { quotaInfo.value = q; }).catch(() => { });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['grid-3']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-3']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
// CSS variable injection 
// CSS variable injection end 
/** @type {[typeof AppShell, typeof AppShell, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppShell, new AppShell({
    title: "任务中心",
}));
const __VLS_1 = __VLS_0({
    title: "任务中心",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_3 = {};
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-stack fade-up" },
});
/** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
// @ts-ignore
const __VLS_4 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
    as: "section",
    ...{ class: "card block" },
}));
const __VLS_5 = __VLS_4({
    as: "section",
    ...{ class: "card block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_4));
__VLS_6.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "tip-text" },
});
(__VLS_ctx.quotaInfo.planName || '-');
(__VLS_ctx.quotaInfo.quotaRemaining ?? 0);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid-3" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
});
(__VLS_ctx.form.sku);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ class: "input" },
});
(__VLS_ctx.form.productName);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.form.category),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
for (const [c] of __VLS_getVForSourceType((__VLS_ctx.categories))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (c),
        value: (c),
    });
    (c);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.form.platform),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
for (const [p] of __VLS_getVForSourceType((__VLS_ctx.platforms))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (p),
        value: (p),
    });
    (p);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.form.market),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
for (const [m] of __VLS_getVForSourceType((__VLS_ctx.markets))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (m),
        value: (m),
    });
    (m);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.form.purpose),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
    value: "",
});
for (const [p] of __VLS_getVForSourceType((__VLS_ctx.purposes))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (p),
        value: (p),
    });
    (p);
}
var __VLS_6;
/** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
    as: "section",
    ...{ class: "card block" },
}));
const __VLS_8 = __VLS_7({
    as: "section",
    ...{ class: "card block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
__VLS_9.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    rows: "2",
    value: (__VLS_ctx.form.title),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    rows: "4",
    value: (__VLS_ctx.form.sellingPoints),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    rows: "4",
    value: (__VLS_ctx.form.detailText),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    rows: "3",
    value: (__VLS_ctx.form.adText),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    rows: "4",
    value: (__VLS_ctx.form.videoScript),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    rows: "4",
    value: (__VLS_ctx.form.mainImageUrlsText),
    placeholder: "https://.../main-01.jpg",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    rows: "4",
    value: (__VLS_ctx.form.sceneImageUrlsText),
    placeholder: "https://.../scene-01.jpg",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "tip-text" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.onMainImagesChange) },
    ...{ class: "input" },
    type: "file",
    accept: "image/*",
    multiple: true,
});
if (__VLS_ctx.localMainImages.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "img-preview-list" },
    });
    for (const [url, idx] of __VLS_getVForSourceType((__VLS_ctx.localMainImages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            key: (`main-${idx}`),
            src: (url),
            alt: "main preview",
            ...{ class: "img-preview" },
        });
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "field" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.onSceneImagesChange) },
    ...{ class: "input" },
    type: "file",
    accept: "image/*",
    multiple: true,
});
if (__VLS_ctx.localSceneImages.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "img-preview-list" },
    });
    for (const [url, idx] of __VLS_getVForSourceType((__VLS_ctx.localSceneImages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            key: (`scene-${idx}`),
            src: (url),
            alt: "scene preview",
            ...{ class: "img-preview" },
        });
    }
}
var __VLS_9;
/** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
// @ts-ignore
const __VLS_10 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
    as: "section",
    ...{ class: "card" },
}));
const __VLS_11 = __VLS_10({
    as: "section",
    ...{ class: "card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_10));
__VLS_12.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.saveDraft) },
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.loading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.startDetect) },
    ...{ class: "btn btn-primary" },
    disabled: (__VLS_ctx.loading),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.submitReview) },
    ...{ class: "btn btn-secondary" },
    disabled: (__VLS_ctx.loading),
});
if (__VLS_ctx.tip) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "tip-text" },
    });
    (__VLS_ctx.tip);
}
var __VLS_12;
if (__VLS_ctx.detecting) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detect-modal-mask" },
    });
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "detect-modal fade-up" },
        radius: (20),
        role: "dialog",
        'aria-modal': "true",
        'aria-label': "检测中",
    }));
    const __VLS_14 = __VLS_13({
        as: "section",
        ...{ class: "detect-modal fade-up" },
        radius: (20),
        role: "dialog",
        'aria-modal': "true",
        'aria-label': "检测中",
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "state loading detect-loading" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "detect-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "detect-step" },
    });
    (__VLS_ctx.detectStep);
    var __VLS_15;
}
if (__VLS_ctx.errorModal.open) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.closeErrorModal) },
        ...{ class: "detect-modal-mask" },
    });
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "detect-modal fade-up" },
        radius: (20),
        role: "dialog",
        'aria-modal': "true",
        'aria-label': "提示",
    }));
    const __VLS_17 = __VLS_16({
        as: "section",
        ...{ class: "detect-modal fade-up" },
        radius: (20),
        role: "dialog",
        'aria-modal': "true",
        'aria-label': "提示",
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_18.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "modal-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "modal-msg" },
    });
    (__VLS_ctx.errorModal.message);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions-row" },
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closeErrorModal) },
        ...{ class: "btn btn-primary" },
    });
    var __VLS_18;
}
var __VLS_2;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['tip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-3']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['tip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['img-preview-list']} */ ;
/** @type {__VLS_StyleScopedClasses['img-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['field']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['img-preview-list']} */ ;
/** @type {__VLS_StyleScopedClasses['img-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['tip-text']} */ ;
/** @type {__VLS_StyleScopedClasses['detect-modal-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['detect-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['detect-loading']} */ ;
/** @type {__VLS_StyleScopedClasses['detect-title']} */ ;
/** @type {__VLS_StyleScopedClasses['detect-step']} */ ;
/** @type {__VLS_StyleScopedClasses['detect-modal-mask']} */ ;
/** @type {__VLS_StyleScopedClasses['detect-modal']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-title']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-msg']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            AppShell: AppShell,
            loading: loading,
            detecting: detecting,
            detectStep: detectStep,
            tip: tip,
            errorModal: errorModal,
            localMainImages: localMainImages,
            localSceneImages: localSceneImages,
            quotaInfo: quotaInfo,
            platforms: platforms,
            markets: markets,
            purposes: purposes,
            categories: categories,
            form: form,
            closeErrorModal: closeErrorModal,
            onMainImagesChange: onMainImagesChange,
            onSceneImagesChange: onSceneImagesChange,
            saveDraft: saveDraft,
            startDetect: startDetect,
            submitReview: submitReview,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
