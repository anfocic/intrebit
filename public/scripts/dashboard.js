(() => {
    const dash = document.querySelector(".dash");
    if (!dash) return;
    const site = dash.dataset.site || "intrebit";
    let days = 30;

    const fmt = (n) => (n == null ? "—" : new Intl.NumberFormat("en").format(n));

    async function fetchJson(path, params) {
        const url = new URL(`/api/stats/${path}`, location.origin);
        url.searchParams.set("site", site);
        url.searchParams.set("days", String(days));
        for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
        const r = await fetch(url.toString());
        if (!r.ok) throw new Error(`${path} ${r.status}`);
        return r.json();
    }

    function renderKpis(s) {
        document.querySelector('[data-kpi="pageviews"]').textContent = fmt(s.pageviews);
        document.querySelector('[data-kpi="events"]').textContent = fmt(s.events);
        document.querySelector('[data-kpi="topPath"]').textContent = s.top_path || s.topPath || "—";
    }

    function renderTimeseries(points) {
        const svg = document.querySelector(".chart");
        const w = 800, h = 220, padL = 32, padR = 12, padT = 16, padB = 28;
        const innerW = w - padL - padR, innerH = h - padT - padB;
        const n = points.length;

        if (n === 0) {
            svg.innerHTML = `<text class="tick" x="${w / 2}" y="${h / 2}" text-anchor="middle">no data in range</text>`;
            return;
        }

        const max = Math.max(1, ...points.map((p) => p.pageviews));
        const slot = innerW / n;
        const barW = Math.max(2, Math.min(40, slot * 0.7));
        const gap = (slot - barW) / 2;

        const bars = points.map((p, i) => {
            const x = padL + slot * i + gap;
            const bh = (p.pageviews / max) * innerH;
            const y = padT + innerH - bh;
            const r = Math.min(3, barW / 2);
            return `<rect class="bar" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(1.5, bh).toFixed(1)}" rx="${r}" ry="${r}"><title>${new Date(p.bucket).toLocaleDateString()}: ${p.pageviews}</title></rect>`;
        }).join("");

        const yVals = max <= 4 ? [0, max] : [0, Math.round(max / 2), max];
        const yAxis = yVals.map((v) => {
            const y = padT + innerH - (v / max) * innerH;
            return `<line class="axis" x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}"/><text class="tick" x="${padL - 6}" y="${(y + 3).toFixed(1)}" text-anchor="end">${v}</text>`;
        }).join("");

        const fmtDate = (b) => new Date(b).toLocaleDateString(undefined, {month: "short", day: "numeric"});
        const labelStride = Math.ceil(n / 6);
        const xLabels = points.map((p, i) => {
            if (i % labelStride !== 0 && i !== n - 1) return "";
            const x = padL + slot * i + slot / 2;
            const anchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
            return `<text class="tick" x="${x.toFixed(1)}" y="${h - 8}" text-anchor="${anchor}">${fmtDate(p.bucket)}</text>`;
        }).join("");

        svg.innerHTML = yAxis + bars + xLabels;
    }

    function renderTop(dim, rows) {
        const ol = document.querySelector(`[data-top="${dim}"]`);
        if (!rows.length) {
            ol.innerHTML = `<li><span class="key">no data</span></li>`;
            return;
        }
        const max = Math.max(1, ...rows.map((r) => r.count));
        ol.innerHTML = rows
            .map((r) => {
                const pct = ((r.count / max) * 100).toFixed(1);
                const label = r.key || "(direct)";
                return `<li style="--w:${pct}%"><span class="key" title="${label}">${label}</span><span class="count">${fmt(r.count)}</span></li>`;
            })
            .join("");
    }

    const VITAL_THRESHOLDS = {
        lcpP75: [2500, 4000],
        fcpP75: [1800, 3000],
        clsP75: [0.1, 0.25],
        inpP75: [200, 500],
        ttfbP75: [800, 1800],
    };

    function classifyVital(key, v) {
        const t = VITAL_THRESHOLDS[key];
        if (!t || v == null) return "";
        if (v <= t[0]) return "vital--good";
        if (v <= t[1]) return "vital--needs";
        return "vital--poor";
    }

    function renderVitals(v) {
        for (const key of Object.keys(VITAL_THRESHOLDS)) {
            const el = document.querySelector(`[data-vital="${key}"]`);
            const val = v[key];
            el.textContent = val == null ? "—" : (key === "clsP75" ? val.toFixed(3) : Math.round(val));
            const card = el.closest(".vital");
            card.classList.remove("vital--good", "vital--needs", "vital--poor");
            const cls = classifyVital(key, val);
            if (cls) card.classList.add(cls);
        }
    }

    function setUpdated() {
        const el = document.querySelector("[data-updated]");
        if (!el) return;
        const t = new Date();
        el.textContent = `updated ${t.toLocaleTimeString(undefined, {hour: "2-digit", minute: "2-digit"})}`;
        el.dataset.ts = String(t.getTime());
    }

    const refreshBtn = document.querySelector('[data-action="refresh"]');

    async function loadAll() {
        if (refreshBtn) refreshBtn.classList.add("is-loading");
        const bucket = days <= 7 ? "hour" : "day";
        try {
            const [summary, timeseries, paths, refs, countries, devices, vitals] = await Promise.all([
                fetchJson("summary"),
                fetchJson("timeseries", {bucket}),
                fetchJson("top", {dim: "path", limit: "10"}),
                fetchJson("top", {dim: "referrer", limit: "10"}),
                fetchJson("top", {dim: "country", limit: "10"}),
                fetchJson("top", {dim: "device", limit: "10"}),
                fetchJson("vitals"),
            ]);
            renderKpis(summary);
            renderTimeseries(timeseries);
            renderTop("path", paths);
            renderTop("referrer", refs);
            renderTop("country", countries);
            renderTop("device", devices);
            renderVitals(vitals);
            setUpdated();
        } catch (err) {
            console.warn("dashboard load failed", err);
        } finally {
            if (refreshBtn) refreshBtn.classList.remove("is-loading");
        }
    }

    document.querySelectorAll(".dash__range button").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".dash__range button").forEach((b) => b.removeAttribute("aria-pressed"));
            btn.setAttribute("aria-pressed", "true");
            days = Number(btn.dataset.days);
            loadAll();
        });
    });

    if (refreshBtn) refreshBtn.addEventListener("click", loadAll);

    loadAll();
})();
