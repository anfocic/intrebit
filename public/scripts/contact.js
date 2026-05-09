(() => {
    const API_BASE = "https://analytics.intrebit.com";
    const ENDPOINT = "/contact";
    const MIN_MESSAGE_LEN = 10;

    const form = document.getElementById("contact-form");
    const success = document.getElementById("cform-success");
    if (!form) return;

    const fields = {
        name: form.querySelector("#cf-name"),
        email: form.querySelector("#cf-email"),
        message: form.querySelector("#cf-message"),
        honeypot: form.querySelector('input[name="company_hp"]'),
    };

    const submitBtn = form.querySelector(".cform__submit");
    const submitLabel = form.querySelector("[data-submit-label]");
    const charCount = form.querySelector("[data-char-count]");
    const errs = {
        name: form.querySelector('[data-err-for="name"]'),
        email: form.querySelector('[data-err-for="email"]'),
        message: form.querySelector('[data-err-for="message"]'),
    };

    const updateCount = () => {
        if (!charCount || !fields.message) return;
        charCount.textContent = `${fields.message.value.length} chars`;
    };
    fields.message?.addEventListener("input", updateCount);
    updateCount();

    const setErr = (key, msg) => {
        if (!errs[key]) return;
        errs[key].textContent = msg ? `↳ ${msg}` : "";
    };

    const setBusy = (busy, label) => {
        if (!submitBtn) return;
        submitBtn.disabled = !!busy;
        submitBtn.setAttribute("aria-disabled", busy ? "true" : "false");
        if (submitLabel && label) submitLabel.textContent = label;
    };

    const showSuccess = (data) => {
        if (!success) return;
        const firstName = (data.name || "").trim().split(/\s+/)[0] || "friend";
        const nameSlot = success.querySelector("[data-success-name]");
        const emailSlot = success.querySelector("[data-success-email]");
        if (nameSlot) nameSlot.textContent = firstName;
        if (emailSlot) emailSlot.textContent = data.email;

        form.hidden = true;
        success.hidden = false;
        success.scrollIntoView({behavior: "smooth", block: "start"});
    };

    const reset = () => {
        form.reset();
        Object.keys(errs).forEach((k) => setErr(k, ""));
        updateCount();
        if (success) success.hidden = true;
        form.hidden = false;
    };

    const sendAnotherBtn = success?.querySelector("[data-send-another]");
    sendAnotherBtn?.addEventListener("click", reset);

    form.addEventListener("submit", async (ev) => {
        ev.preventDefault();

        if (fields.honeypot && fields.honeypot.value) return;

        Object.keys(errs).forEach((k) => setErr(k, ""));

        const name = fields.name?.value.trim() || "";
        const email = fields.email?.value.trim() || "";
        const message = fields.message?.value.trim() || "";

        if (!email) { setErr("email", "Please enter your email"); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("email", "That doesn't look right"); return; }
        if (!message) { setErr("message", "Please enter a short message"); return; }
        if (message.length < MIN_MESSAGE_LEN) { setErr("message", `A few more words, please (min ${MIN_MESSAGE_LEN})`); return; }

        const payload = {
            name: name || "Website form",
            email,
            message,
        };

        setBusy(true, "Sending...");

        try {
            const res = await fetch(`${API_BASE}${ENDPOINT}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            showSuccess(payload);
            setBusy(false, "Send message");
        } catch (err) {
            setErr("message", "Something went wrong. Try again or email hello@intrebit.com.");
            setBusy(false, "Send message");
        }
    });
})();
