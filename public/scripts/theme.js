document.documentElement.classList.add("js");
(() => {
    const storageKey = "theme";
    const doc = document.documentElement;

    const getInitialTheme = () => {
        const stored = localStorage.getItem(storageKey);
        if (stored === "light" || stored === "dark") return stored;

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    };

    const setTheme = (theme) => {
        doc.dataset.theme = theme;
        localStorage.setItem(storageKey, theme);

        // keep toggles accessible + in sync
        document.querySelectorAll(".theme-toggle").forEach((btn) => {
            btn.setAttribute("aria-label", theme);
            btn.setAttribute("data-theme", theme); // optional if you ever want styling
        });
    };

    const toggleTheme = () => {
        const current = doc.dataset.theme || "light";
        setTheme(current === "dark" ? "light" : "dark");
    };

    // ✅ Set ASAP before paint
    doc.dataset.theme = getInitialTheme();

    // ✅ Bind click handlers once DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".theme-toggle").forEach((btn) => {
            btn.addEventListener("click", toggleTheme);
            btn.setAttribute("aria-label", doc.dataset.theme);
        });
    });

    // ✅ Sync with OS changes only if user hasn't picked manually
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem(storageKey)) {
            setTheme(e.matches ? "dark" : "light");
        }
    });
})();