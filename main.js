const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#site-nav");
const siteHeader = document.querySelector(".site-header");
const scrollSentinel = document.querySelector(".scroll-sentinel");

const scrollObserver = new IntersectionObserver(([entry]) => {
  siteHeader.classList.toggle("is-scrolled", !entry.isIntersecting);
});

scrollObserver.observe(scrollSentinel);

function setMenuOpen(open) {
  navigation.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

menuButton.addEventListener("click", () => {
  setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    setMenuOpen(false);
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = document.getElementById(link.hash.slice(1));
  if (!target) return;

  event.preventDefault();
  history.pushState(null, "", link.hash);
  target.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
  });
});

const teamCarousel = document.querySelector(".team-carousel");
const teamTrack = document.querySelector(".team-track");
const teamGroup = document.querySelector(".team-group");
const teamToggle = document.querySelector(".team-carousel-toggle");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let teamCarouselWidth = 0;

function updateTeamCarousel() {
  teamCarouselWidth = teamCarousel.clientWidth;
  const paused = teamCarousel.classList.contains("is-paused");
  teamCarousel.classList.remove("is-animated", "is-paused");
  teamCarousel.scrollLeft = 0;
  teamTrack.querySelectorAll('.team-group[aria-hidden="true"]').forEach((group) => group.remove());
  teamToggle.hidden = reducedMotion.matches;

  if (reducedMotion.matches) return;

  const groupWidth = teamGroup.getBoundingClientRect().width;
  const copies = Math.max(1, Math.ceil(teamCarousel.clientWidth / groupWidth));
  for (let index = 0; index < copies; index += 1) {
    const copy = teamGroup.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    teamTrack.appendChild(copy);
  }

  teamTrack.style.setProperty("--team-loop-distance", `${groupWidth}px`);
  teamTrack.style.setProperty("--team-loop-duration", `${groupWidth / 45}s`);
  teamCarousel.classList.add("is-animated");
  teamCarousel.classList.toggle("is-paused", paused);
  teamToggle.textContent = paused ? "Play" : "Pause";
  teamToggle.setAttribute("aria-label", paused ? "Play team carousel" : "Pause team carousel");
}

teamToggle.addEventListener("click", () => {
  const paused = teamCarousel.classList.toggle("is-paused");
  if (!paused) teamCarousel.scrollLeft = 0;
  teamToggle.textContent = paused ? "Play" : "Pause";
  teamToggle.setAttribute("aria-label", paused ? "Play team carousel" : "Pause team carousel");
});

teamCarousel.addEventListener("blur", () => {
  if (!teamCarousel.classList.contains("is-paused")) teamCarousel.scrollLeft = 0;
});

reducedMotion.addEventListener("change", updateTeamCarousel);
window.addEventListener("resize", () => {
  if (teamCarousel.clientWidth !== teamCarouselWidth) updateTeamCarousel();
});
updateTeamCarousel();

const projects = document.querySelector(".projects");
const projectShowcase = document.querySelector(".project-showcase");
const projectSlides = Array.from(document.querySelectorAll(".project-slide"));
const projectControls = document.querySelector(".project-controls");
const projectCounter = document.querySelector(".project-counter");
const projectStatus = document.querySelector(".project-status");
const projectToggle = document.querySelector(".project-toggle");
let projectIndex = 0;
let projectTimer = null;
let projectsVisible = false;
let projectsPaused = false;

function showProject(index, announce = false) {
  const previousHeight = projectShowcase.offsetHeight;
  projectSlides[projectIndex].hidden = true;
  projectIndex = (index + projectSlides.length) % projectSlides.length;
  const slide = projectSlides[projectIndex];
  slide.hidden = false;
  projectCounter.textContent = `${String(projectIndex + 1).padStart(2, "0")} / ${String(projectSlides.length).padStart(2, "0")}`;
  projectStatus.textContent = announce
    ? `Project ${projectIndex + 1} of ${projectSlides.length}: ${slide.querySelector("h3").innerText.replace(/\s+/g, " ")}`
    : "";
  if (previousHeight !== projectShowcase.offsetHeight && typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.refresh();
  }
}

function updateProjectTimer() {
  clearInterval(projectTimer);
  projectTimer = null;
  projectToggle.hidden = reducedMotion.matches;
  if (projectsVisible && !projectsPaused && !reducedMotion.matches && !document.hidden) {
    projectTimer = setInterval(() => showProject(projectIndex + 1), 8000);
  }
}

document.querySelector(".project-prev").addEventListener("click", () => {
  showProject(projectIndex - 1, true);
  updateProjectTimer();
});
document.querySelector(".project-next").addEventListener("click", () => {
  showProject(projectIndex + 1, true);
  updateProjectTimer();
});
projectToggle.addEventListener("click", () => {
  projectsPaused = !projectsPaused;
  projectToggle.textContent = projectsPaused ? "Play" : "Pause";
  projectToggle.setAttribute("aria-label", projectsPaused ? "Play project carousel" : "Pause project carousel");
  updateProjectTimer();
});
projectShowcase.addEventListener("focusin", (event) => {
  if (!event.target.matches(":focus-visible") || reducedMotion.matches) return;
  projectsPaused = true;
  projectToggle.textContent = "Play";
  projectToggle.setAttribute("aria-label", "Play project carousel");
  updateProjectTimer();
});
document.addEventListener("visibilitychange", updateProjectTimer);
reducedMotion.addEventListener("change", updateProjectTimer);

const projectObserver = new IntersectionObserver(([entry]) => {
  projectsVisible = entry.isIntersecting;
  if (projectsVisible) {
    projectShowcase.querySelectorAll('img[loading="lazy"]').forEach((image) => {
      image.loading = "eager";
    });
  }
  updateProjectTimer();
}, { threshold: 0.1 });

projectControls.hidden = false;
projectToggle.hidden = reducedMotion.matches;
projects.classList.add("is-ready");
projectObserver.observe(projectShowcase);

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  const motion = gsap.matchMedia();
  motion.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray("[data-reveal]").forEach((element) => {
      gsap.from(element, {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 92%",
          once: true,
        },
      });
    });

    gsap.utils.toArray("[data-parallax]").forEach((image) => {
      gsap.fromTo(image, { yPercent: -4 }, {
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: image.parentElement,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    const experience = document.querySelector(".reviews-experience");
    experience.classList.add("is-animated");

    gsap.utils.toArray(".review-slot").forEach((slot, index) => {
      gsap.fromTo(slot.querySelector(".quote-card"), {
        opacity: 0,
        xPercent: index % 2 === 0 ? 45 : -45,
        y: 60,
        rotation: index % 2 === 0 ? 12 : -12,
      }, {
        opacity: 1,
        xPercent: 0,
        y: 0,
        rotation: index % 2 === 0 ? -1 : 1,
        ease: "none",
        scrollTrigger: {
          trigger: slot,
          start: "top 95%",
          end: "top 55%",
          scrub: true,
        },
      });
    });

    return () => experience.classList.remove("is-animated");
  });
} else {
  console.warn("GSAP or ScrollTrigger could not be loaded; scroll animations are disabled.");
}
