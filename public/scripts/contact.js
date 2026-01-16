(() => {
    console.log("contact.js loaded");
    const API_BASE = "https://api.intrebit.com";
    const ENDPOINT = "/contact";

    const form = document.getElementById("contact-form");
    const status = document.getElementById("contact-status");

    if (!form || !status) return;

    const setStatus = (msg, type = "info") => {
        status.textContent = msg;
        status.classList.remove("status--success", "status--error", "status--info");
        status.classList.add(`status--${type}`);
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("submit fired ✅");
        setStatus("Sending…", "info");

        const data = new FormData(form);

        //todo fix this since mail doesnt send
        // // Honeypot
        // if (data.get("company")) {
        //     setStatus("Thanks — got it.", "success");
        //     form.reset();
        //     return;
        // }

        const name = data.get("name")?.toString().trim();
        const email = data.get("email")?.toString().trim();
        const message = data.get("message")?.toString().trim();

        if (!email || !message) {
            setStatus("Please enter your email and a short message.", "error");
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
            form.reset();
        } catch (err) {
            console.error(err);
            setStatus("Something went wrong. Try again.", "error");
        }
    });
})();