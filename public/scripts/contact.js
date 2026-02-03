(() => {
    const API_BASE = "https://api.intrebit.com";
    const ENDPOINT = "/contact";

    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-status");
    if (!form || !status) return;

    const btn = form.querySelector(".contact-form__submit");
    const card = form.closest(".contact-card");

    // --- helpers
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const animate = (el, keyframes, options) => {
        if (!el || prefersReduced || !el.animate) return null;
        return el.animate(keyframes, options);
    };

    const setBusy = (busy, label) => {
        if (!btn) return;
        btn.disabled = !!busy;
        btn.setAttribute("aria-disabled", busy ? "true" : "false");
        btn.dataset.loading = busy ? "true" : "false";
        if (label) btn.textContent = label;
    };

    const setStatus = (msg, type = "info") => {
        status.textContent = msg;
        status.classList.remove("status--success", "status--error", "status--info");
        status.classList.add(`status--${type}`);

        // status entrance
        animate(
            status,
            [
                { opacity: 0, transform: "translateY(6px)", filter: "blur(6px)" },
                { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
            ],
            { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" }
        );
    };

    const successFlair = () => {
        // Confirm "pop" on card
        animate(
            card,
            [
                { transform: "translateY(0) scale(1)" },
                { transform: "translateY(-2px) scale(1.01)" },
                { transform: "translateY(0) scale(1)" },
            ],
            { duration: 360, easing: "cubic-bezier(.2,.8,.2,1)" }
        );

        // Button ticks to success briefly
        if (btn) {
            animate(
                btn,
                [
                    { transform: "scale(1)" },
                    { transform: "scale(1.02)" },
                    { transform: "scale(1)" },
                ],
                { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" }
            );
        }
    };

    const errorFlair = () => {
        // Shake status
        animate(
            status,
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-6px)" },
                { transform: "translateX(6px)" },
                { transform: "translateX(-4px)" },
                { transform: "translateX(4px)" },
                { transform: "translateX(0)" },
            ],
            { duration: 320, easing: "ease-out" }
        );

        // Small "nope" on button
        animate(
            btn,
            [
                { transform: "translateX(0)" },
                { transform: "translateX(-4px)" },
                { transform: "translateX(4px)" },
                { transform: "translateX(0)" },
            ],
            { duration: 220, easing: "ease-out" }
        );
    };

    // Button micro "commit" press
    if (btn && window.matchMedia?.("(hover: hover)")?.matches) {
        btn.addEventListener("mousedown", () => {
            btn.dataset.pressed = "true";
            btn.style.transformOrigin = "center";
            btn.style.transform = "scale(0.98)";
        });

        const release = () => {
            if (!btn.dataset.pressed) return;
            delete btn.dataset.pressed;
            btn.style.transform = "";
        };

        btn.addEventListener("mouseup", release);
        btn.addEventListener("mouseleave", release);
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Clear old status quickly
        status.textContent = "";
        status.className = "contact-form__status";

        setBusy(true, "Sending…");
        setStatus("Sending…", "info");

        const data = new FormData(form);

        const name = data.get("name")?.toString().trim();
        const email = data.get("email")?.toString().trim();
        const message = data.get("message")?.toString().trim();

        if (!email || !message) {
            setBusy(false, "Send message");
            setStatus("Please enter your email and a short message.", "error");
            errorFlair();
            return;
        }

        const payload = {
            name: name || "Website form",
            email,
            message,
        };

        try {
            const res = await fetch(`${API_BASE}${ENDPOINT}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Request failed (${res.status})`);

            setStatus("Sent — I’ll reply soon.", "success");
            successFlair();

            form.reset();
            setBusy(true, "Sent ✓");

            // Restore button after a moment
            setTimeout(() => setBusy(false, "Send message"), 2200);
        } catch (err) {
            console.error(err);
            setBusy(false, "Try again");
            setStatus("Something went wrong. Try again.", "error");
            errorFlair();
        }
    });
})();