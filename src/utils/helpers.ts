export function getPathname(url: URL): string {
    return url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
}

export function formatDate(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}
