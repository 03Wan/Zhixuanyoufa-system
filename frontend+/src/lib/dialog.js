function openDialog(kind, message, title) {
    if (typeof window === "undefined")
        return Promise.resolve(kind !== "confirm");
    return new Promise((resolve) => {
        window.dispatchEvent(new CustomEvent("zyyf-dialog", {
            detail: {
                kind,
                title: title || (kind === "confirm" ? "确认操作" : "提示"),
                message,
                resolve,
            },
        }));
    });
}
export function notify(message, title = "提示") {
    return openDialog("alert", message, title).then(() => undefined);
}
export function confirmDialog(message, title = "确认操作") {
    return openDialog("confirm", message, title);
}
export function toast(message, kind = "success", duration = 2200) {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new CustomEvent("zyyf-toast", {
        detail: { message, kind, duration },
    }));
}
