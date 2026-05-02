document.addEventListener("DOMContentLoaded", () => {

    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector("nav ul");
    const scrollBtn = document.getElementById("scrollTop");
    const navbar = document.getElementById("navbar");
    const cursor = document.querySelector(".cursor");
    const heroCircle = document.querySelector(".hero-circle");
    const navLinks = document.querySelectorAll("nav a");
    const progressBars = document.querySelectorAll(".progress-bar");

    // ==============================
    // HAMBURGER MENU
    // ==============================
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            navMenu.classList.toggle("show");
            hamburger.innerHTML = navMenu.classList.contains("show") ? "&times;" : "&#9776;";
            // position dropdown just below the navbar
            if (navMenu.classList.contains("show")) {
                navMenu.style.top = navbar.offsetHeight + "px";
            }
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("show");
                hamburger.innerHTML = "&#9776;";
            });
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
    // NAVBAR SHADOW ON SCROLL
    // ==============================
    window.addEventListener("scroll", () => {
        if (!navbar) return;
        navbar.style.boxShadow =
            window.scrollY > 50 ? "0 4px 12px rgba(0,0,0,0.3)" : "none";
    });

    // ==============================
    // INTERSECTION OBSERVER (reveal animations)
    // threshold: 0.05 so sections trigger early on mobile
    // ==============================
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.05 });

    document.querySelectorAll(".reveal, .reveal-text").forEach(el => {
        observer.observe(el);
    });

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
    // ACTIVE NAV LINK ON SCROLL
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
            if (link.getAttribute("href") && link.getAttribute("href").includes(current)) {
                link.classList.add("active-link");
            }
        });
    });

    // ==============================
    // HERO PARALLAX
    // ==============================
    if (heroCircle) {
        window.addEventListener("mousemove", (e) => {
            let x = (window.innerWidth / 2 - e.clientX) * 0.02;
            let y = (window.innerHeight / 2 - e.clientY) * 0.02;
            heroCircle.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    // ==============================
    // CUSTOM CURSOR
    // ==============================
    if (cursor) {
        window.addEventListener("mousemove", (e) => {
            cursor.style.left = e.clientX + "px";
            cursor.style.top = e.clientY + "px";
        });
    }

    // ==============================
    // SCROLL PROGRESS BAR
    // ==============================
    const scrollProgress = document.getElementById("scrollProgress");
    if (scrollProgress) {
        window.addEventListener("scroll", () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = progress + "%";
        });
    }

});
