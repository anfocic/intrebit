export function onClientReady(fn: () => void): void {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return;
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
        fn();
    }
}