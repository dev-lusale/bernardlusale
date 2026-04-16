// ==============================
// HAMBURGER MENU
// ==============================

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector("nav ul");

hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("show");
});

// Close menu when clicking link (mobile)

document.querySelectorAll("nav a").forEach(link => {
    link.addEventListener("click", () => {
        navMenu.classList.remove("show");
    });
});


// ==============================
// COUNTER ANIMATION
// ==============================

const counters = document.querySelectorAll(".counter");

const runCounters = () => {

    counters.forEach(counter => {

        const target =
            +counter.getAttribute("data-target");

        let count = 0;

        const increment = target / 100;

        const updateCounter = () => {

            count += increment;

            if (count < target) {

                counter.innerText =
                    Math.floor(count);

                requestAnimationFrame(updateCounter);

            } else {

                counter.innerText = target;

            }

        };

        updateCounter();

    });

};


// ==============================
// SKILL PROGRESS BARS
// ==============================

const progressBars =
    document.querySelectorAll(".progress-bar");

const showProgress = () => {

    progressBars.forEach(bar => {

        const value =
            bar.getAttribute("data-progress");

        bar.style.width = value + "%";

    });

};


// ==============================
// SCROLL TO TOP BUTTON
// ==============================

const scrollBtn =
    document.getElementById("scrollTop");

window.addEventListener("scroll", () => {

    // Show scroll button

    if (window.scrollY > 300) {

        scrollBtn.style.display = "block";

    } else {

        scrollBtn.style.display = "none";

    }

});

scrollBtn.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


// ==============================
// NAVBAR SHADOW ON SCROLL
// ==============================

const navbar =
    document.getElementById("navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.3)";

    } else {

        navbar.style.boxShadow =
            "none";

    }

});


// ==============================
// INTERSECTION OBSERVER
// (Triggers animations when visible)
// ==============================

const observer =
    new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                // Run counters

                if (
                    entry.target.classList.contains("counter")
                ) {

                    runCounters();

                }

                // Show progress bars

                if (
                    entry.target.classList.contains("progress-bar")
                ) {

                    showProgress();

                }

            }

        });

    },
        {
            threshold: 0.5
        }
    );


// Observe counters

counters.forEach(counter => {
    observer.observe(counter);
});

// Observe progress bars

progressBars.forEach(bar => {
    observer.observe(bar);
});