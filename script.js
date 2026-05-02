document.addEventListener("DOMContentLoaded", () => {
    // ==============================
    // SAFETY HELPERS
    // ==============================
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector("nav ul");
    const scrollBtn = document.getElementById("scrollTop");
    const navbar = document.getElementById("navbar");
    const cursor = document.querySelector(".cursor");
    const heroCircle = document.querySelector(".hero-circle");

    const counters = document.querySelectorAll(".counter");
    const progressBars = document.querySelectorAll(".progress-bar");
    const reveals = document.querySelectorAll(".reveal");
    const textElements = document.querySelectorAll(".reveal-text");
    const navLinks = document.querySelectorAll("nav a");


    // ==============================
    // HAMBURGER MENU
    // ==============================
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            navMenu.classList.toggle("show");
        });

        document.querySelectorAll("nav a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("show");
            });
        });
    }


    // ==============================
    // COUNTER ANIMATION (RUN ONCE)
    // ==============================
    let countersStarted = false;

    function runCounters() {
        if (countersStarted) return;
        countersStarted = true;

        counters.forEach(counter => {
            const target = +counter.getAttribute("data-target");
            let count = 0;
            const speed = target / 100;

            function update() {
                count += speed;

                if (count < target) {
                    counter.innerText = Math.floor(count);
                    requestAnimationFrame(update);
                } else {
                    counter.innerText = target;
                }
            }

            update();
        });
    }


    // ==============================
    // SKILL PROGRESS BARS
    // ==============================
    let progressStarted = false;

    function showProgress() {
        if (progressStarted) return;
        progressStarted = true;

        progressBars.forEach(bar => {
            const value = bar.getAttribute("data-progress");
            bar.style.width = value + "%";
        });
    }


    // ==============================
    // SCROLL TO TOP
    // ==============================
    if (scrollBtn) {
        window.addEventListener("scroll", () => {
            scrollBtn.style.display = window.scrollY > 300 ? "block" : "none";
        });

        scrollBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }


    // ==============================
    // NAVBAR SHADOW
    // ==============================
    window.addEventListener("scroll", () => {
        if (!navbar) return;

        navbar.style.boxShadow =
            window.scrollY > 50
                ? "0 4px 12px rgba(0,0,0,0.3)"
                : "none";
    });


    // ==============================
    // INTERSECTION OBSERVER (OPTIMIZED)
    // ==============================
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("active");
            observer.unobserve(entry.target); // IMPORTANT: run once only
        });
    }, {
        threshold: 0.2
    });

    document.querySelectorAll(".reveal, .reveal-text").forEach(el => {
        observer.observe(el);
    });

    // ==============================
    // ACTIVE NAV LINK SCROLL
    // ==============================
    window.addEventListener("scroll", () => {
        let current = "";

        document.querySelectorAll("section").forEach(section => {
            const top = window.scrollY;
            const offset = section.offsetTop - 150;
            const height = section.offsetHeight;

            if (top >= offset && top < offset + height) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active-link");

            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active-link");
            }
        });
    });


    // ==============================
    // HERO PARALLAX MOUSE EFFECT
    // ==============================
    if (heroCircle) {
        window.addEventListener("mousemove", (e) => {
            let x = (window.innerWidth / 2 - e.clientX) * 0.02;
            let y = (window.innerHeight / 2 - e.clientY) * 0.02;

            heroCircle.style.transform = `translate(${x}px, ${y}px)`;
        });
    }


    // ==============================
    // MAGNETIC BUTTON EFFECT
    // ==============================
    document.querySelectorAll(".hero-btn, button, .service-card")
        .forEach(btn => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();

                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                btn.style.transform =
                    `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
            });

            btn.addEventListener("mouseleave", () => {
                btn.style.transform = "translate(0,0) scale(1)";
            });
        });


    // ==============================
    // CUSTOM CURSOR
    // ==============================
    if (cursor) {
        window.addEventListener("mousemove", (e) => {
            cursor.style.left = e.clientX + "px";
            cursor.style.top = e.clientY + "px";
        });
    }
});