(function () {
    const API_URL = 'https://api.intrebit.com/analytics/pageview';

    function getPayload() {
        return {
            path: window.location.pathname,
            referrer: document.referrer || '',
            device_type:
                window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
            browser: /firefox/i.test(navigator.userAgent)
                ? 'firefox'
                : /safari/i.test(navigator.userAgent) && !/chrome/i.test(navigator.userAgent)
                    ? 'safari'
                    : /chrome/i.test(navigator.userAgent)
                        ? 'chrome'
                        : 'other',
            screen_size:
                window.innerWidth < 1024 ? 'small' : window.innerWidth < 1920 ? 'medium' : 'large',
        };
    }

    function postViaFetch(data) {
        // Use fetch with keepalive + credentials omitted. This avoids CORS credential-mode issues.
        // NOTE: Some adblockers may still block requests based on URL keywords.
        return fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            keepalive: true,
            credentials: 'omit',
            mode: 'cors',
        }).catch(function () {
            // Swallow errors: analytics must never break the page.
        });
    }

    function track() {
        try {
            var data = getPayload();
            void postViaFetch(data);
        } catch (e) {
            // Never throw from analytics.
        }
    }

    // Ensure we run once after the page is ready.
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        track();
    } else {
        window.addEventListener('load', track, { once: true });
    }
})();

(function () {
    const API_URL = 'https://api.intrebit.com/analytics/engagement';

    const startMs = Date.now();
    let maxScrollDepth = 0;
    let sentExit = false;

    function clamp(n, min, max) {
        return Math.max(min, Math.min(max, n));
    }

    function getScrollDepthPercent() {
        const doc = document.documentElement;
        const body = document.body;

        const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;
        const viewportH = window.innerHeight || doc.clientHeight || 0;

        const scrollH = Math.max(
            body.scrollHeight,
            doc.scrollHeight,
            body.offsetHeight,
            doc.offsetHeight,
            body.clientHeight,
            doc.clientHeight
        );

        const maxScrollable = scrollH - viewportH;
        if (maxScrollable <= 0) return 100;

        const pct = Math.round((scrollTop / maxScrollable) * 100);
        return clamp(pct, 0, 100);
    }

    function getPayload(exited) {
        const seconds = Math.floor((Date.now() - startMs) / 1000);
        return {
            path: window.location.pathname,
            time_on_page: clamp(seconds, 0, 7200),
            scroll_depth: clamp(maxScrollDepth, 0, 100),
            exited: !!exited,
        };
    }

    function postViaBeacon(data) {
        try {
            if (!navigator.sendBeacon) return false;
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            return navigator.sendBeacon(API_URL, blob);
        } catch (e) {
            return false;
        }
    }

    function postViaFetch(data) {
        return fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            keepalive: true,
            credentials: 'omit',
            mode: 'cors',
        }).catch(function () {
            // Swallow errors: analytics must never break the page.
        });
    }

    function send(exited) {
        try {
            const data = getPayload(exited);
            if (exited) {
                // Prefer beacon on exit/unload paths.
                if (postViaBeacon(data)) return;
            }
            void postViaFetch(data);
        } catch (e) {
            // Never throw from analytics.
        }
    }

    function updateScrollDepth() {
        try {
            const d = getScrollDepthPercent();
            if (d > maxScrollDepth) maxScrollDepth = d;
        } catch (e) {}
    }

    // Track scrolling (lightweight).
    window.addEventListener('scroll', updateScrollDepth, { passive: true });
    window.addEventListener('resize', updateScrollDepth, { passive: true });

    // Send an "exited" event exactly once.
    function sendExitOnce() {
        if (sentExit) return;
        sentExit = true;
        updateScrollDepth();
        send(true);
    }

    // Helpful non-exit snapshot (optional but useful): send after page becomes interactive.
    function sendInitial() {
        updateScrollDepth();
        send(false);
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        sendInitial();
    } else {
        window.addEventListener('load', sendInitial, { once: true });
    }

    // Exit signals: cover modern + mobile Safari.
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