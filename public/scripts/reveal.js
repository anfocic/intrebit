(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    // ---------- scroll reveal ----------
    function initReveal() {
        const els = document.querySelectorAll("[data-reveal]");
        if (!els.length) return;

        els.forEach((el) => {
            const stagger = el.hasAttribute("data-reveal-stagger");
            el.classList.add(stagger ? "reveal-stagger" : "reveal");
        });

        if (reduced) {
            els.forEach((el) => el.classList.add("is-in"));
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("is-in");
                        io.unobserve(e.target);
                    }
                });
            },
            {threshold: 0.12, rootMargin: "0px 0px -40px 0px"}
        );

        els.forEach((el) => io.observe(el));
    }

    // ---------- scroll progress ----------
    function initProgress() {
        const bar = document.querySelector("[data-scroll-progress]");
        if (!bar) return;

        const update = () => {
            const top = window.scrollY;
            const h = document.documentElement.scrollHeight - window.innerHeight;
            const p = h > 0 ? Math.min(1, top / h) : 0;
            bar.style.width = (p * 100) + "%";
        };

        update();
        window.addEventListener("scroll", update, {passive: true});
        window.addEventListener("resize", update, {passive: true});
    }

    function init() {
        initReveal();
        initProgress();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
