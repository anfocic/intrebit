function initMobileNav() {
    const openBtn = document.querySelector("[data-mobile-open]");
    const overlay = document.querySelector("[data-mobile-overlay]");
    const panel = document.querySelector("[data-mobile-sidebar]"); // same attr, now panel

    if (!openBtn || !overlay || !panel) return;

    // prevent duplicate binding across astro swaps
    if (openBtn.dataset.bound === "1") return;
    openBtn.dataset.bound = "1";

    function open() {
        document.body.classList.add("menu-open");
        overlay.classList.add("is-open");
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");
        openBtn.setAttribute("aria-expanded", "true");
    }

    function close() {
        document.body.classList.remove("menu-open");
        overlay.classList.remove("is-open");
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        openBtn.setAttribute("aria-expanded", "false");
    }

    function toggle() {
        panel.classList.contains("is-open") ? close() : open();
    }

    // Toggle on hamburger
    openBtn.addEventListener("click", toggle);

    // Click outside (overlay) closes
    overlay.addEventListener("click", close);

    // Link click closes
    panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));

    // Escape closes
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("is-open")) close();
    });

    // Ensure closed on init
    close();
}

document.addEventListener("DOMContentLoaded", initMobileNav);
document.addEventListener("astro:page-load", initMobileNav);
document.addEventListener("astro:after-swap", initMobileNav);