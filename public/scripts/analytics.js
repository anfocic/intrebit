(function () {
    'use strict';

    const BASE = 'https://api.intrebit.com/public/analytics';
    const PV_URL = `${BASE}/pv`;
    const ENG_URL = `${BASE}/engagement`;

    // ── Shared helpers ───────────────────────────────────────────────────────

    // UUID v4 with best-available entropy:
    //   1) crypto.randomUUID
    //   2) crypto.getRandomValues
    //   3) Math.random (last resort)
    function uuidV4() {
        const c = globalThis.crypto;

        if (c?.randomUUID) return c.randomUUID();

        if (c?.getRandomValues) {
            const bytes = new Uint8Array(16);
            try {
                c.getRandomValues(bytes);

                // Set version (4) + variant (10)
                bytes[6] = (bytes[6] & 0x0f) | 0x40;
                bytes[8] = (bytes[8] & 0x3f) | 0x80;

                const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
                return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
            } catch (_) {
                // fall through
            }
        }

        // Last resort (rare): not cryptographically strong
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
            const r = (Math.random() * 16) | 0;
            return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    }

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function deviceType() {
        const w = window.innerWidth;
        return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
    }

    function browserName() {
        const ua = navigator.userAgent;
        // Order matters (Chrome UA often includes Safari)
        if (/firefox/i.test(ua)) return 'firefox';
        if (/chrome/i.test(ua)) return 'chrome';
        if (/safari/i.test(ua)) return 'safari';
        return 'other';
    }

    function screenSize() {
        const w = window.innerWidth;
        return w < 1024 ? 'small' : w < 1920 ? 'medium' : 'large';
    }

    async function postJson(url, data) {
        try {
            return await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                keepalive: true,
                cache: 'no-store',
                credentials: 'omit',
                mode: 'cors',
            });
        } catch (_) {
            // swallow
        }
    }

    function postJsonBeaconOrFetch(url, data) {
        // Prefer beacon on exit-like events
        try {
            if (navigator.sendBeacon) {
                const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                if (navigator.sendBeacon(url, blob)) return;
            }
        } catch (_) {
            // fall back
        }

        void fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            keepalive: true,
            cache: 'no-store',
            credentials: 'omit',
            mode: 'cors',
        }).catch(function () {});
    }

    function onLoadOnce(fn) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            fn();
        } else {
            window.addEventListener('load', fn, { once: true });
        }
    }

    // ── Pageview tracker ─────────────────────────────────────────────────────

    function sendPageview() {
        const payload = {
            event_id: uuidV4(),
            path: window.location.pathname,
            referrer: document.referrer || '',
            device_type: deviceType(),
            browser: browserName(),
            screen_size: screenSize(),
        };

        void postJson(PV_URL, payload);
    }

    onLoadOnce(sendPageview);

    // ── Engagement tracker ───────────────────────────────────────────────────

    var startMs = Date.now();
    var maxScrollDepth = 0;
    var sentExit = false;

    function scrollDepthPercent() {
        var doc = document.documentElement;
        var body = document.body;

        var scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
        var viewportH = window.innerHeight || doc.clientHeight || 0;

        var scrollH = Math.max(
            body.scrollHeight,
            doc.scrollHeight,
            body.offsetHeight,
            doc.offsetHeight,
            body.clientHeight,
            doc.clientHeight
        );

        var maxScrollable = scrollH - viewportH;
        if (maxScrollable <= 0) return 100;

        var pct = Math.round((scrollTop / maxScrollable) * 100);
        return clamp(pct, 0, 100);
    }

    function updateScrollDepth() {
        try {
            const d = scrollDepthPercent();
            if (d > maxScrollDepth) maxScrollDepth = d;
        } catch (_) {}
    }

    function engagementPayload(exited) {
        var seconds = Math.floor((Date.now() - startMs) / 1000);
        return {
            event_id: uuidV4(),
            path: window.location.pathname,
            time_on_page: clamp(seconds, 0, 7200),
            scroll_depth: clamp(maxScrollDepth, 0, 100),
            exited: !!exited,
        };
    }

    function sendEngagement(exited) {
        updateScrollDepth();
        const data = engagementPayload(exited);

        // If we're exiting, try beacon first.
        if (exited) {
            postJsonBeaconOrFetch(ENG_URL, data);
            return;
        }

        void postJson(ENG_URL, data);
    }

    window.addEventListener('scroll', updateScrollDepth, { passive: true });
    window.addEventListener('resize', updateScrollDepth, { passive: true });

    function sendExitOnce() {
        if (sentExit) return;
        sentExit = true;
        sendEngagement(true);
    }

    onLoadOnce(function () {
        sendEngagement(false);
    });

    window.addEventListener('pagehide', sendExitOnce, { once: true });
    window.addEventListener('beforeunload', sendExitOnce, { once: true });
    document.addEventListener(
        'visibilitychange',
        function () {
            if (document.visibilityState === 'hidden') sendExitOnce();
        },
        { once: true }
    );
})();
