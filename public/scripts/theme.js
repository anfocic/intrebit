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
    };

    const set = (theme) => {
        localStorage.setItem(storageKey, theme);
        apply(theme);
    };

    apply(getInitial());

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const next = doc.dataset.theme === "dark" ? "light" : "dark";
                set(next);
            });
        });
    });

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        if (!localStorage.getItem(storageKey)) {
            apply(e.matches ? "dark" : "light");
        }
    });
})();
