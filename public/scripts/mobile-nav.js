function initMobileNav() {
    const openBtn = document.querySelector("[data-mobile-open]");
    const closeBtn = document.querySelector("[data-mobile-close]");
    const overlay = document.querySelector("[data-mobile-overlay]");
    const sidebar = document.querySelector("[data-mobile-sidebar]");

    if (!openBtn || !closeBtn || !overlay || !sidebar) return;

    // prevent duplicate binding
    if (openBtn.dataset.bound === "1") return;
    openBtn.dataset.bound = "1";

    function open() {
        document.body.classList.add("menu-open");
        overlay.classList.add("is-open");
        sidebar.classList.add("is-open");
        sidebar.setAttribute("aria-hidden", "false");
        openBtn.setAttribute("aria-expanded", "true");
    }

    function close() {
        document.body.classList.remove("menu-open");
        overlay.classList.remove("is-open");
        sidebar.classList.remove("is-open");
        sidebar.setAttribute("aria-hidden", "true");
        openBtn.setAttribute("aria-expanded", "false");
    }

    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);

    sidebar.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("is-open")) close();
    });

    close();
}

document.addEventListener("DOMContentLoaded", initMobileNav);
document.addEventListener("astro:page-load", initMobileNav);
document.addEventListener("astro:after-swap", initMobileNav);