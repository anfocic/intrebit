(() => {
    const REVEAL_AT_MS = 3800;

    const egg = document.querySelector(".hero-easteregg");
    if (egg) {
        window.setTimeout(() => egg.classList.add("is-visible"), REVEAL_AT_MS);
    }
})()