(() => {
    const API_BASE = "https://api.intrebit.com/public";
    const ENDPOINT = "/lead";

    const form = document.getElementById("contact-form");
    const success = document.getElementById("cform-success");
    if (!form || !success) return;

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

    const validate = () => {
        const e = {};
        const name = fields.name.value.trim();
        const email = fields.email.value.trim();
        const message = fields.message.value.trim();

        if (!name) e.name = "Name is required";
        if (!email) e.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "That doesn't look right";

        if (!message) e.message = "Tell us a little about it";
        else if (message.length < 10) e.message = "A few more words, please";

        Object.keys(errs).forEach((k) => setErr(k, e[k] || ""));
        return Object.keys(e).length === 0;
    };

    const setBusy = (busy) => {
        submitBtn.disabled = busy;
        if (submitLabel) submitLabel.textContent = busy ? "Sending..." : "Send message";
    };

    const showSuccess = (data) => {
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
        success.hidden = true;
        form.hidden = false;
    };

    const sendAnotherBtn = success.querySelector("[data-send-another]");
    sendAnotherBtn?.addEventListener("click", reset);

    form.addEventListener("submit", async (ev) => {
        ev.preventDefault();

        if (fields.honeypot && fields.honeypot.value) return;
        if (!validate()) return;

        const payload = {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            message: fields.message.value.trim(),
        };

        setBusy(true);

        try {
            const res = await fetch(`${API_BASE}${ENDPOINT}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            showSuccess(payload);
        } catch (err) {
            setErr("message", "Something went wrong. Try again or email hello@intrebit.com.");
        } finally {
            setBusy(false);
        }
    });
})();
