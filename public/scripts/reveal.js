(() => {
    const setupReveal = () => {
        const els = document.querySelectorAll(".reveal");
        if (!els.length) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    io.unobserve(entry.target);
                });
            },
            {
                threshold: 0.18,
                rootMargin: "0px 0px -10% 0px",
            }
        );

        els.forEach((el) => io.observe(el));
    };

    // ✅ Astro supports this event on every navigation
    document.addEventListener("astro:page-load", setupReveal);

    // ✅ fallback for non-Astro nav / hard refresh
    document.addEventListener("DOMContentLoaded", setupReveal);
})();