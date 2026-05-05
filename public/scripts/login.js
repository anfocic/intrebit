(function () {
    const form = document.getElementById("login-form");
    if (!form) return;
    const errorEl = form.querySelector("[data-error]");
    const submit = form.querySelector("button[type=submit]");

    function getNext() {
        const params = new URLSearchParams(window.location.search);
        const raw = params.get("next");
        if (!raw) return "/dashboard";
        if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
        return raw;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorEl.hidden = true;
        submit.disabled = true;
        const data = new FormData(form);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {"content-type": "application/json"},
                body: JSON.stringify({
                    username: String(data.get("username") ?? ""),
                    password: String(data.get("password") ?? ""),
                }),
            });
            if (res.status === 204) {
                window.location.replace(getNext());
                return;
            }
            if (res.status === 429) {
                errorEl.textContent = "too many attempts — try again later";
            } else {
                errorEl.textContent = "invalid credentials";
            }
            errorEl.hidden = false;
        } catch {
            errorEl.textContent = "network error";
            errorEl.hidden = false;
        } finally {
            submit.disabled = false;
        }
    });
})();
