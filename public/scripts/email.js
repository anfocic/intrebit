(() => {
    const decode = () => {
        document.querySelectorAll("[data-email-user][data-email-host]").forEach((el) => {
            const user = el.getAttribute("data-email-user");
            const host = el.getAttribute("data-email-host");
            if (!user || !host) return;
            const addr = `${user}@${host}`;
            if (el.tagName === "A") el.setAttribute("href", `mailto:${addr}`);
            if (el.dataset.emailLabel !== "keep") el.textContent = addr;
            el.removeAttribute("data-email-user");
            el.removeAttribute("data-email-host");
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", decode);
    } else {
        decode();
    }
})();
