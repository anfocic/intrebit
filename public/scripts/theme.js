document.documentElement.classList.add("js");
(() => {
    const storageKey = "theme";
    const doc = document.documentElement;

    const sysPrefersDark = () =>
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const getInitial = () => {
        const stored = localStorage.getItem(storageKey);
        if (stored === "light" || stored === "dark") return stored;
        return sysPrefersDark() ? "dark" : "light";
    };

    const apply = (theme) => {
        doc.dataset.theme = theme;
        document.querySelectorAll("[data-theme-toggle]").forEach((root) => {
            root.querySelectorAll("[data-theme-option]").forEach((btn) => {
                const active = btn.dataset.themeOption === theme;
                btn.classList.toggle("is-active", active);
                btn.setAttribute("aria-checked", active ? "true" : "false");
            });
        });
    };

    const set = (theme) => {
        localStorage.setItem(storageKey, theme);
        apply(theme);
    };

    /* run before paint */
    apply(getInitial());

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-theme-toggle]").forEach((root) => {
            root.querySelectorAll("[data-theme-option]").forEach((btn) => {
                btn.addEventListener("click", () => set(btn.dataset.themeOption));
            });
        });
        apply(doc.dataset.theme);
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem(storageKey)) {
            apply(e.matches ? "dark" : "light");
        }
    });
})();
