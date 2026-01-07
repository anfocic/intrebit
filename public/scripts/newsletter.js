(() => {
    const API_BASE = "https://api.intrebit.com";
    const ENDPOINT = "/contact";

    const form = document.getElementById("newsletter-form");
    const status = document.getElementById("newsletter-status");

    if (!form || !status) return;

    const setStatus = (msg, type = "info") => {
        status.textContent = msg;
        status.classList.remove("status--success", "status--error", "status--info");
        status.classList.add(`status--${type}`);
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        setStatus("Sending…", "info");

        const data = new FormData(form);

        // Honeypot → silent success
        if (data.get("company")) {
            setStatus("Thanks — you're on the list.", "success");
            form.reset();
            return;
        }

        const email = data.get("email")?.toString().trim();

        if (!email) {
            setStatus("Please enter a valid email.", "error");
            return;
        }

        const payload = {
            name: "Newsletter signup",
            email,
            message: `Newsletter signup: ${email}`,
        };

        try {
            const res = await fetch(`${API_BASE}${ENDPOINT}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Request failed (${res.status})`);

            setStatus("Thanks — you're on the list.", "success");
            form.reset();
        } catch (err) {
            console.error(err);
            setStatus("Something went wrong. Try again.", "error");
        }
    });
})();