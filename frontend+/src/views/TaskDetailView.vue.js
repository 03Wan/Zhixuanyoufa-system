import AppGlassSurface from "@/components/AppGlassSurface.vue";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, getFriendlyError } from "@/lib/api";
const route = useRoute();
const router = useRouter();
const id = String(route.params.id);
const isEditing = ref(route.query.edit === "1");
const error = ref("");
const loading = reactive({ detail: true, save: false, detect: false, report: false });
const detail = reactive({});
const material = reactive({ title: "", sellingPoints: "", detailText: "", adText: "" });
const images = ref([]);
const versions = ref([]);
const newImage = reactive({ type: "主图", file: null });
const statusMap = {
    PENDING_DETECTION: "待检测",
    DETECTING: "检测中",
    COMPLETED: "已完成",
    REVIEW_REQUIRED: "待复核",
    HOLD: "暂缓发布",
    REPORTED: "已出报告",
    DRAFT: "待检测",
};
const statusLabel = (s) => statusMap[String(s || "").toUpperCase()] || s || "-";
function normalizeMaterials(raw) {
    material.title = raw?.title || "";
    material.sellingPoints = Array.isArray(raw?.sellingPoints) ? raw.sellingPoints.join("\n") : raw?.sellingPoints || "";
    material.detailText = raw?.detailText || "";
    material.adText = raw?.adText || "";
    const rawImgs = Array.isArray(raw?.imageUrls) ? raw.imageUrls : [];
    images.value = rawImgs.map((u, idx) => ({ id: `img-${idx}-${Date.now()}`, type: "主图", url: u }));
}
async function loadDetail() {
    loading.detail = true;
    error.value = "";
    try {
        const data = await api.getTaskDetail(id);
        Object.assign(detail, data || {});
        normalizeMaterials(data?.materialContent || {});
        const vs = await api.getMaterialVersions(id);
        versions.value = (vs || []).map((v) => ({ ...v, scoreSnapshot: v.scoreSnapshot?.totalScore ?? v.scoreSnapshot, riskSnapshot: v.riskSnapshot?.riskLevel ?? v.riskSnapshot }));
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        loading.detail = false;
    }
}
async function saveVersion() {
    await api.snapshotMaterialVersion(id, {
        title: material.title,
        sellingPoints: material.sellingPoints,
        detailText: material.detailText,
        adText: material.adText,
        imageUrls: images.value.map((i) => i.url),
    });
    await loadDetail();
}
function toggleEdit() {
    isEditing.value = !isEditing.value;
}
function onFileChange(event) {
    const target = event.target;
    const file = target.files?.[0];
    if (!file)
        return;
    newImage.file = file;
    images.value.push({
        id: `img-${Date.now()}`,
        type: newImage.type,
        url: URL.createObjectURL(file),
    });
    target.value = "";
}
function removeImage(imgId) {
    images.value = images.value.filter((i) => i.id !== imgId);
}
async function saveAll() {
    loading.save = true;
    error.value = "";
    try {
        await api.updateTask(id, {
            productName: detail.productName,
            category: detail.category,
            platform: detail.platform,
            market: detail.market,
            purpose: detail.purpose,
        });
        await api.saveTaskMaterials(id, {
            title: material.title,
            sellingPoints: material.sellingPoints.split("\n").map((x) => x.trim()).filter(Boolean),
            detailText: material.detailText,
            adText: material.adText,
            imageUrls: images.value.map((i) => i.url),
        });
        isEditing.value = false;
        await loadDetail();
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        loading.save = false;
    }
}
async function runDetect() {
    if (detail.status === "DETECTING")
        return;
    loading.detect = true;
    try {
        await api.updateTaskStatus(id, "DETECTING");
        detail.status = "DETECTING";
        await api.analyzeTask(id);
        await api.updateTaskStatus(id, "COMPLETED");
        detail.status = "COMPLETED";
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        loading.detect = false;
    }
}
function viewResult() {
    router.push(`/results?taskId=${encodeURIComponent(id)}`);
}
async function generateReport() {
    loading.report = true;
    try {
        const report = await api.generateReport(id);
        await api.updateTaskStatus(id, "REPORTED");
        router.push(`/reports/${report.id || "demo-report-1"}`);
    }
    catch (e) {
        error.value = getFriendlyError(e);
    }
    finally {
        loading.report = false;
    }
}
function goBack() {
    router.push("/home");
}
onMounted(loadDetail);
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['image-card']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['image-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "page-stack fade-up" },
});
/** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
    as: "header",
    ...{ class: "card row-between" },
}));
const __VLS_1 = __VLS_0({
    as: "header",
    ...{ class: "card row-between" },
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
__VLS_2.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "section-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "text-muted" },
});
(__VLS_ctx.detail.taskNo || __VLS_ctx.detail.id || "-");
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "actions-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.goBack) },
    ...{ class: "btn btn-secondary" },
});
var __VLS_2;
if (__VLS_ctx.loading.detail) {
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_3 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card state loading" },
    }));
    const __VLS_4 = __VLS_3({
        as: "section",
        ...{ class: "card state loading" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_3));
    __VLS_5.slots.default;
    var __VLS_5;
}
else if (__VLS_ctx.error) {
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card" },
        ...{ style: {} },
    }));
    const __VLS_7 = __VLS_6({
        as: "section",
        ...{ class: "card" },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    __VLS_8.slots.default;
    (__VLS_ctx.error);
    var __VLS_8;
}
else {
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card" },
    }));
    const __VLS_10 = __VLS_9({
        as: "section",
        ...{ class: "card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "grid-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ class: "input" },
        disabled: (!__VLS_ctx.isEditing),
    });
    (__VLS_ctx.detail.productName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ class: "input" },
        disabled: (!__VLS_ctx.isEditing),
    });
    (__VLS_ctx.detail.category);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ class: "input" },
        disabled: (!__VLS_ctx.isEditing),
    });
    (__VLS_ctx.detail.platform);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ class: "input" },
        disabled: (!__VLS_ctx.isEditing),
    });
    (__VLS_ctx.detail.market);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ class: "input" },
        disabled: (!__VLS_ctx.isEditing),
    });
    (__VLS_ctx.detail.purpose);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ class: "input" },
        value: (__VLS_ctx.statusLabel(__VLS_ctx.detail.status)),
        disabled: true,
    });
    var __VLS_11;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card" },
    }));
    const __VLS_13 = __VLS_12({
        as: "section",
        ...{ class: "card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    __VLS_14.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-stack" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        rows: "2",
        value: (__VLS_ctx.material.title),
        disabled: (!__VLS_ctx.isEditing),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        rows: "4",
        value: (__VLS_ctx.material.sellingPoints),
        disabled: (!__VLS_ctx.isEditing),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        rows: "5",
        value: (__VLS_ctx.material.detailText),
        disabled: (!__VLS_ctx.isEditing),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.textarea, __VLS_intrinsicElements.textarea)({
        rows: "3",
        value: (__VLS_ctx.material.adText),
        disabled: (!__VLS_ctx.isEditing),
    });
    var __VLS_14;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_15 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card" },
    }));
    const __VLS_16 = __VLS_15({
        as: "section",
        ...{ class: "card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_15));
    __VLS_17.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row-between" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
        value: (__VLS_ctx.newImage.type),
        disabled: (!__VLS_ctx.isEditing),
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "主图",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "细节图",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        value: "场景图",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        ...{ onChange: (__VLS_ctx.onFileChange) },
        type: "file",
        accept: "image/*",
        disabled: (!__VLS_ctx.isEditing),
    });
    if (__VLS_ctx.images.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "state" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "image-grid" },
        });
        for (const [img] of __VLS_getVForSourceType((__VLS_ctx.images))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
                key: (img.id),
                ...{ class: "image-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (img.url),
                alt: (img.type),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "row-between" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "text-muted" },
            });
            (img.type);
            if (__VLS_ctx.isEditing) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                    ...{ onClick: (...[$event]) => {
                            if (!!(__VLS_ctx.loading.detail))
                                return;
                            if (!!(__VLS_ctx.error))
                                return;
                            if (!!(__VLS_ctx.images.length === 0))
                                return;
                            if (!(__VLS_ctx.isEditing))
                                return;
                            __VLS_ctx.removeImage(img.id);
                        } },
                    ...{ class: "btn btn-secondary" },
                });
            }
        }
    }
    var __VLS_17;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_18 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card row-between" },
    }));
    const __VLS_19 = __VLS_18({
        as: "section",
        ...{ class: "card row-between" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_18));
    __VLS_20.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.toggleEdit) },
        ...{ class: "btn btn-secondary" },
    });
    (__VLS_ctx.isEditing ? "取消编辑" : "编辑任务");
    if (__VLS_ctx.isEditing) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (__VLS_ctx.saveAll) },
            ...{ class: "btn btn-primary" },
            disabled: (__VLS_ctx.loading.save),
        });
        (__VLS_ctx.loading.save ? "保存中..." : "保存素材与任务");
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "actions-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.runDetect) },
        ...{ class: "btn btn-secondary" },
        disabled: (__VLS_ctx.loading.detect || __VLS_ctx.detail.status === 'DETECTING'),
    });
    (__VLS_ctx.loading.detect ? "检测中..." : __VLS_ctx.detail.status === 'DETECTING' ? "检测中" : "启动检测");
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.viewResult) },
        ...{ class: "btn btn-secondary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.generateReport) },
        ...{ class: "btn btn-primary" },
        disabled: (__VLS_ctx.loading.report),
    });
    (__VLS_ctx.loading.report ? "生成中..." : "生成报告");
    var __VLS_20;
    /** @type {[typeof AppGlassSurface, typeof AppGlassSurface, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(AppGlassSurface, new AppGlassSurface({
        as: "section",
        ...{ class: "card" },
    }));
    const __VLS_22 = __VLS_21({
        as: "section",
        ...{ class: "card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "row-between" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ style: {} },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.saveVersion) },
        ...{ class: "btn btn-secondary" },
    });
    if (__VLS_ctx.versions.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "state" },
        });
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "table-wrap" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.table, __VLS_intrinsicElements.table)({
            ...{ class: "table" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.thead, __VLS_intrinsicElements.thead)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.th, __VLS_intrinsicElements.th)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.tbody, __VLS_intrinsicElements.tbody)({});
        for (const [v] of __VLS_getVForSourceType((__VLS_ctx.versions))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.tr, __VLS_intrinsicElements.tr)({
                key: (v.id),
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (v.versionNo);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (v.title || '-');
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (v.scoreSnapshot ?? '-');
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (v.riskSnapshot ?? '-');
            __VLS_asFunctionalElement(__VLS_intrinsicElements.td, __VLS_intrinsicElements.td)({});
            (v.createdAt || '-');
        }
    }
    var __VLS_23;
}
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['fade-up']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['loading']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-2']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['input']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['page-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['image-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['image-card']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-muted']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['actions-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-primary']} */ ;
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['row-between']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-secondary']} */ ;
/** @type {__VLS_StyleScopedClasses['state']} */ ;
/** @type {__VLS_StyleScopedClasses['table-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['table']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AppGlassSurface: AppGlassSurface,
            isEditing: isEditing,
            error: error,
            loading: loading,
            detail: detail,
            material: material,
            images: images,
            versions: versions,
            newImage: newImage,
            statusLabel: statusLabel,
            saveVersion: saveVersion,
            toggleEdit: toggleEdit,
            onFileChange: onFileChange,
            removeImage: removeImage,
            saveAll: saveAll,
            runDetect: runDetect,
            viewResult: viewResult,
            generateReport: generateReport,
            goBack: goBack,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
