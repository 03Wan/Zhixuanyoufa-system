export type GlassRuntimeMode = "shader" | "standard" | "static";
export declare function useGlassCapability(): {
    enabled: import("vue").ComputedRef<boolean>;
    mode: import("vue").ComputedRef<GlassRuntimeMode>;
    reason: import("vue").ComputedRef<string>;
};
