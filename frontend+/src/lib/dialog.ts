export type DialogKind = "alert" | "confirm";
export type ToastKind = "success" | "error" | "info";

type DialogPayload = {
  kind: DialogKind;
  title: string;
  message: string;
  resolve: (value: boolean) => void;
};

type ToastPayload = {
  message: string;
  kind?: ToastKind;
  duration?: number;
};

function openDialog(kind: DialogKind, message: string, title?: string) {
  if (typeof window === "undefined") return Promise.resolve(kind !== "confirm");
  return new Promise<boolean>((resolve) => {
    window.dispatchEvent(
      new CustomEvent<DialogPayload>("zyyf-dialog", {
        detail: {
          kind,
          title: title || (kind === "confirm" ? "确认操作" : "提示"),
          message,
          resolve,
        },
      }),
    );
  });
}

export function notify(message: string, title = "提示") {
  return openDialog("alert", message, title).then(() => undefined);
}

export function confirmDialog(message: string, title = "确认操作") {
  return openDialog("confirm", message, title);
}

export function toast(message: string, kind: ToastKind = "success", duration = 2200) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastPayload>("zyyf-toast", {
      detail: { message, kind, duration },
    }),
  );
}
