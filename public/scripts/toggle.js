document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-trigger]").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const service = trigger.closest("[data-service]");
            if (!service) return;

            const isOpen = service.getAttribute("data-open") === "true";
            service.setAttribute("data-open", String(!isOpen));
            trigger.setAttribute("aria-expanded", String(!isOpen));
        });
    });
});