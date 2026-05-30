export type DialogKind = "alert" | "confirm";
export type ToastKind = "success" | "error" | "info";
export declare function notify(message: string, title?: string): Promise<undefined>;
export declare function confirmDialog(message: string, title?: string): Promise<boolean>;
export declare function toast(message: string, kind?: ToastKind, duration?: number): void;
