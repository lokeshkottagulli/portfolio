// ── Theme Switcher ────────────────────────────────────
(function initTheme() {
  const saved = localStorage.getItem("portfolio_theme");
  const theme = saved || "light";
  document.documentElement.setAttribute("data-theme", theme);

  const setupToggle = () => {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme") || "light";
      const next = active === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("portfolio_theme", next);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupToggle);
  } else {
    setupToggle();
  }
})();

/* ======================================================
   LOKESH FDE PORTFOLIO — Main Script
   ====================================================== */

// ── DOM refs ─────────────────────────────────────────
const menuBtn    = document.getElementById("menuToggle");
const nav        = document.getElementById("mainNav");
const navLinks   = document.querySelectorAll(".nav-link");
const progress   = document.getElementById("scrollProgress");
const yearEl     = document.getElementById("year");
const headerEl   = document.getElementById("siteHeader");
const video      = document.querySelector(".hero-video");
const soundBtn   = document.getElementById("soundToggle");
const playBtn    = document.getElementById("heroPlayToggle");
const dynamicEl  = document.getElementById("dynamicText");

// ── Year ──────────────────────────────────────────────
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── AOS Init ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (typeof AOS !== "undefined") {
    AOS.init({ duration: 700, easing: "ease-out", once: true, offset: 60 });
  }
});

// ── Sound toggle ──────────────────────────────────────
if (soundBtn && video) {
  soundBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    soundBtn.classList.toggle("muted", video.muted);
    soundBtn.setAttribute("aria-label", video.muted ? "Unmute video" : "Mute video");
  });
}

// ── Mobile nav ────────────────────────────────────────
menuBtn?.addEventListener("click", () => {
  const open = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("open", !open);
});
navLinks.forEach(l => l.addEventListener("click", () => {
  nav.classList.remove("open");
  menuBtn?.setAttribute("aria-expanded", "false");
}));

// ── Scroll progress ───────────────────────────────────
const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  if (progress) progress.style.width = pct + "%";
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// ── Header scroll state ───────────────────────────────
window.addEventListener("scroll", () => {
  if (headerEl) headerEl.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

// ── Active nav section highlight ──────────────────────
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
document.querySelectorAll("main section[id]").forEach(s => sectionObserver.observe(s));

// ── Video fallback ────────────────────────────────────
if (video && playBtn) {
  const syncPlayback = () => {
    playBtn.textContent = video.error ? "Retry video" : video.paused ? "Play video" : "Pause video";
  };
  const playVideo = () => video.play().catch(syncPlayback);

  if (headerEl) {
    let videoVisible = false;
    let videoPlaying = false;
    const syncHeader = () => {
      headerEl.classList.toggle("hero-video-playing", videoVisible && videoPlaying);
    };

    new IntersectionObserver(([entry]) => {
      videoVisible = entry.isIntersecting;
      syncHeader();
    }).observe(video);

    video.addEventListener("playing", () => {
      videoPlaying = true;
      syncHeader();
    });
    for (const event of ["pause", "ended", "waiting", "error"]) {
      video.addEventListener(event, () => {
        videoPlaying = false;
        syncHeader();
      });
    }
  }

  for (const event of ["play", "pause", "error"]) {
    video.addEventListener(event, syncPlayback);
  }
  playBtn.addEventListener("click", () => {
    if (video.error) video.load();
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  });

  syncPlayback();
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) playVideo();
}

// ── Typewriter ────────────────────────────────────────
(function initTypewriter() {
  if (!dynamicEl) return;
  const cursorEl = document.querySelector(".typewriter-cursor");
  if (!cursorEl) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    dynamicEl.textContent = "working solutions.";
    return;
  }

  const phrases = [
    "working solutions.",
    "production\nAI systems.",
    "scalable\narchitectures.",
    "measurable\nimpact."
  ];

  let idx = 0, deleting = false, current = "", tid = null;

  const setCursor = typing => {
    cursorEl.classList.toggle("blinking", !typing);
    cursorEl.classList.toggle("typing",   typing);
  };

  const tick = () => {
    const full = phrases[idx];
    setCursor(true);
    if (deleting) {
      current = full.slice(0, current.length - 1);
      dynamicEl.textContent = current;
      if (current === "") {
        deleting = false;
        idx = (idx + 1) % phrases.length;
        setCursor(false);
        tid = setTimeout(tick, 420);
        return;
      }
      tid = setTimeout(tick, 28);
    } else {
      current = full.slice(0, current.length + 1);
      dynamicEl.textContent = current;
      if (current === full) {
        deleting = true;
        setCursor(false);
        tid = setTimeout(tick, idx === 0 ? 3200 : 2500);
        return;
      }
      const last = current.slice(-1);
      const delay = [".", ",", "-"].includes(last) ? 220 : last === " " ? 85 : Math.random() * 32 + 42;
      tid = setTimeout(tick, delay);
    }
  };

  // Start after brief pause
  dynamicEl.textContent = "";
  current = "";
  tid = setTimeout(tick, 800);

  // Click to skip
  dynamicEl.style.cursor = "pointer";
  dynamicEl.addEventListener("click", () => {
    if (tid) clearTimeout(tid);
    deleting = true;
    tick();
  });
})();

// ── Contact Form ──────────────────────────────────────
const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");
const submitBtn = document.getElementById("submitBtn");

if (contactForm && formFeedback) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("nameInput")?.value.trim() || "";
    const originalBtnHtml = submitBtn.innerHTML;

    // Show sending state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending...</span>`;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;

      formFeedback.className = "form-feedback success";
      formFeedback.innerHTML = `✓ Thank you, <strong>${name || "there"}</strong>! Your message has been sent. I'll get back to you shortly.`;
      formFeedback.style.display = "block";

      contactForm.reset();

      setTimeout(() => {
        formFeedback.style.display = "none";
      }, 7000);
    }, 850);
  });
}

// ── Certifications Filtering ──────────────────────────
const certFilterBtns = document.querySelectorAll(".cert-filter-btn");
const certCards = document.querySelectorAll(".cert-card");

if (certFilterBtns.length > 0 && certCards.length > 0) {
  certFilterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      certFilterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");

      certCards.forEach(card => {
        const cat = card.getAttribute("data-category") || "";
        const categories = cat.split(/\s+/);
        if (filter === "all" || categories.includes(filter)) {
          card.classList.remove("is-hidden");
        } else {
          card.classList.add("is-hidden");
        }
      });
      if (typeof AOS !== "undefined") {
        AOS.refresh();
      }
    });
  });
}

// ── Certificate Modal ─────────────────────────────────
const certModalBackdrop = document.getElementById("certModalBackdrop");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalTitle = document.getElementById("modalTitle");
const modalType = document.getElementById("modalType");
const modalIssuer = document.getElementById("modalIssuer");
const modalDate = document.getElementById("modalDate");
const modalCertId = document.getElementById("modalCertId");
const modalImageContainer = document.getElementById("modalImageContainer");
const modalImage = document.getElementById("modalImage");
const modalDownloadLink = document.getElementById("modalDownloadLink");
const modalVerifyLink = document.getElementById("modalVerifyLink");
const modalBadgeTitle = document.getElementById("modalBadgeTitle");
const modalBadgePill = document.getElementById("modalBadgePill");

function openCertModal(data) {
  if (!certModalBackdrop) return;
  if (modalTitle) modalTitle.textContent = data.title;
  if (modalType) modalType.textContent = data.type;
  if (modalBadgeTitle) modalBadgeTitle.textContent = data.title;
  if (modalIssuer) modalIssuer.textContent = data.issuer || "Fynity Innovations LLP";
  if (modalDate) modalDate.textContent = data.date || "November 16, 2026";
  if (modalCertId) modalCertId.textContent = data.id || "4e299d5284d14e9ab2f514d932f391c5";

  if (modalBadgePill) {
    modalBadgePill.textContent = data.type;
    const isDomain = data.type && data.type.toLowerCase().includes("domain");
    const isInfosys = data.issuer && data.issuer.toLowerCase().includes("infosys");
    modalBadgePill.className = "cert-type-pill " + (isDomain ? "domain" : isInfosys ? "infosys" : "course");
  }

  if (data.image) {
    if (modalImage) modalImage.src = encodeURI(data.image);
    if (modalImageContainer) modalImageContainer.style.display = "block";
  } else {
    if (modalImageContainer) modalImageContainer.style.display = "none";
  }

  const fileUrl = data.pdf || data.image || "certificates/Fynity_Certificate_DSA.pdf";
  if (modalDownloadLink) {
    modalDownloadLink.href = encodeURI(fileUrl);
    const ext = fileUrl.endsWith(".pdf") ? ".pdf" : ".jpg";
    modalDownloadLink.setAttribute("download", `${data.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Certificate${ext}`);
    const span = modalDownloadLink.querySelector("span");
    if (span) span.textContent = fileUrl.endsWith(".pdf") ? "Download Official PDF" : "Download Certificate";
  }

  const verifyUrl = data.verify || "https://www.careerezi.com/verify";
  if (modalVerifyLink) {
    modalVerifyLink.href = verifyUrl;
    const verifySpan = modalVerifyLink.querySelector("span");
    if (verifySpan) {
      if (verifyUrl.includes("wingspan")) {
        verifySpan.innerHTML = "Verify on Wingspan &#x2197;";
      } else {
        verifySpan.innerHTML = "Verify on CareerEzi &#x2197;";
      }
    }
  }

  certModalBackdrop.classList.add("open");
  certModalBackdrop.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCertModal() {
  if (!certModalBackdrop) return;
  certModalBackdrop.classList.remove("open");
  certModalBackdrop.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-action='preview']").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    openCertModal({
      title: btn.dataset.title || "Certificate",
      type: btn.dataset.type || "COURSE",
      issuer: btn.dataset.issuer || "Fynity Innovations",
      date: btn.dataset.date || "November 16, 2026",
      id: btn.dataset.id || "4e299d5284d14e9ab2f514d932f391c5",
      pdf: btn.dataset.pdf || "",
      image: btn.dataset.image || "",
      verify: btn.dataset.verify || ""
    });
  });
});

modalCloseBtn?.addEventListener("click", closeCertModal);
certModalBackdrop?.addEventListener("click", (e) => {
  if (e.target === certModalBackdrop) closeCertModal();
});
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && certModalBackdrop?.classList.contains("open")) {
    closeCertModal();
  }
});


