function initMobileNav() {
    const openBtn = document.querySelector("[data-mobile-open]");
    const overlay = document.querySelector("[data-mobile-overlay]");
    const panel = document.querySelector("[data-mobile-sidebar]");

    if (!openBtn || !overlay || !panel) return;

    // prevent duplicate binding across astro swaps
    if (openBtn.dataset.bound === "1") return;
    openBtn.dataset.bound = "1";

    // Ensure trigger has correct ARIA wiring
    openBtn.setAttribute("aria-haspopup", "dialog");
    openBtn.setAttribute("aria-controls", "mobile-nav-panel");
    if (!openBtn.hasAttribute("aria-expanded")) openBtn.setAttribute("aria-expanded", "false");

    // Give the panel an id for aria-controls (safe if already set)
    if (!panel.id) panel.id = "mobile-nav-panel";

    // Helpers
    const focusablesSelector =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function getFirstFocusable() {
        return panel.querySelector(focusablesSelector);
    }

    function open() {
        // show overlay + panel
        document.body.classList.add("menu-open");
        overlay.hidden = false;
        overlay.classList.add("is-open");

        panel.hidden = false;              // IMPORTANT: remove from DOM flow when closed
        panel.removeAttribute("inert");    // IMPORTANT: allow focus/click when open
        panel.classList.add("is-open");
        panel.setAttribute("aria-hidden", "false");

        openBtn.setAttribute("aria-expanded", "true");

        // focus first link/button in the panel
        requestAnimationFrame(() => {
            getFirstFocusable()?.focus();
        });
    }

    function close() {
        document.body.classList.remove("menu-open");
        overlay.classList.remove("is-open");
        overlay.hidden = true;

        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
        panel.setAttribute("inert", "");   // IMPORTANT: prevent focus/click while aria-hidden
        panel.hidden = true;               // IMPORTANT: removes focusable descendants from tab order

        openBtn.setAttribute("aria-expanded", "false");
    }

    function toggle() {
        panel.classList.contains("is-open") ? close() : open();
    }

    // Toggle on hamburger
    openBtn.addEventListener("click", toggle);

    // Click outside (overlay) closes
    overlay.addEventListener("click", close);

    // Click inside panel on any link closes (nav UX)
    panel.querySelectorAll("a[href]").forEach((a) => a.addEventListener("click", close));

    // Escape closes + return focus to trigger
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("is-open")) {
            close();
            openBtn.focus();
        }
    });

    // Ensure closed on init
    close();
}

document.addEventListener("DOMContentLoaded", initMobileNav);
document.addEventListener("astro:page-load", initMobileNav);
document.addEventListener("astro:after-swap", initMobileNav);