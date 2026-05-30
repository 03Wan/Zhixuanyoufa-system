export type DialogKind = "alert" | "confirm";
export declare function notify(message: string, title?: string): Promise<undefined>;
export declare function confirmDialog(message: string, title?: string): Promise<boolean>;
