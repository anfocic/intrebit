(() => {
    // ✅ Set theme ASAP (before paint)
    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = stored ?? (systemDark ? "dark" : "light");

    // ✅ Theme toggle click handler (runs after DOM ready)
    const setTheme = (t) => {
        document.documentElement.dataset.theme = t;
        localStorage.setItem("theme", t);
    };

    const toggleTheme = () => {
        const current = document.documentElement.dataset.theme || "light";
        setTheme(current === "dark" ? "light" : "dark");
    };

    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.querySelector(".theme-toggle");
        if (!btn) return;
        btn.addEventListener("click", toggleTheme);
    });
})();