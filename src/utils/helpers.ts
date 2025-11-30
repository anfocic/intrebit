export function getPathname(url: URL): string {
    return url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, '');
}
