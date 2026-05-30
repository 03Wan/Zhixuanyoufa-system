type SurfaceVariant = "default" | "soft" | "elevated" | "flat";
type __VLS_Props = {
    variant?: SurfaceVariant;
    interactive?: boolean;
    padding?: string;
    radius?: number;
    as?: string;
    class?: string;
    forceStatic?: boolean;
};
declare var __VLS_10: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_10) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    variant: SurfaceVariant;
    interactive: boolean;
    padding: string;
    radius: number;
    as: string;
    class: string;
    forceStatic: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
