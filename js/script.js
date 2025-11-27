/* script.js — comportamiento del sitio: menú, dropdowns, likes (stored in localStorage) */

/* Helper: set year in footer */
document.addEventListener("DOMContentLoaded", () => {
  const y = new Date().getFullYear();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = y;

  // Initialize nav toggles
  initNavToggles();
  // Initialize dropdown buttons
  initDropdowns();
  // Initialize like buttons (restore counts & states)
  initLikes();
});

/* NAV: multiple toggle buttons across pages */
function initNavToggles(){
  const toggles = document.querySelectorAll(".nav-toggle");
  toggles.forEach(btn => {
    const id = btn.getAttribute("id");
    // find corresponding nav through aria-controls or sibling nav
    const controls = btn.getAttribute("aria-controls");
    const nav = controls ? document.getElementById(controls) : btn.parentElement.querySelector(".main-nav");
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      if (!expanded){
        // show nav
        if (nav) nav.style.display = "block";
      } else {
        if (nav) nav.style.display = "";
      }
    });
  });

  // Close mobile nav when clicking outside
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.closest(".site-header")) {
      document.querySelectorAll(".main-nav").forEach(nav => {
        if (window.innerWidth <= 800) nav.style.display = "";
      });
      document.querySelectorAll(".nav-toggle").forEach(btn => btn.setAttribute("aria-expanded","false"));
    }
  });

  // Responsive: ensure nav visible on resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) {
      document.querySelectorAll(".main-nav").forEach(nav => nav.style.display = "");
      document.querySelectorAll(".nav-toggle").forEach(btn => btn.setAttribute("aria-expanded","false"));
    }
  });
}

/* Dropdown menus in header */
function initDropdowns(){
  document.querySelectorAll(".dropdown-btn").forEach(btn => {
    const parent = btn.parentElement;
    const dropdown = parent.querySelector(".dropdown");
    btn.addEventListener("click", (e) => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      if (!expanded) dropdown.style.display = "block";
      else dropdown.style.display = "none";
    });

    // close dropdown when clicking outside
    document.addEventListener("click", (ev) => {
      if (!parent.contains(ev.target)) {
        btn.setAttribute("aria-expanded","false");
        if (dropdown) dropdown.style.display = "none";
      }
    });
  });
}

/* Likes system */
const STORAGE_KEY = "likenet_likes_v1";

/* Load saved state or initialize */
function loadLikes(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn("Error leyendo localStorage:", e);
    return {};
  }
}
function saveLikes(state){
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Error guardando localStorage:", e);
  }
}

function initLikes(){
  const state = loadLikes();

  // Initialize counts for all like-btns on page
  document.querySelectorAll(".like-btn").forEach(btn => {
    const id = btn.getAttribute("data-id");
    const countEl = btn.querySelector(".like-count");
    if (!id) return;

    // if state missing, set defaults
    if (!state[id]) state[id] = {count:0, liked:false};

    // apply UI state
    btn.setAttribute("aria-pressed", state[id].liked ? "true" : "false");
    countEl.textContent = state[id].count;

    // click handler
    btn.addEventListener("click", () => {
      const current = state[id] || {count:0, liked:false};
      if (current.liked){
        current.liked = false;
        current.count = Math.max(0, current.count - 1);
      } else {
        current.liked = true;
        current.count = current.count + 1;
      }
      // update UI
      btn.setAttribute("aria-pressed", current.liked ? "true" : "false");
      countEl.textContent = current.count;
      // save
      state[id] = current;
      saveLikes(state);
    });

    // keyboard accessibility: Enter / Space
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // In case user naviga a otra página: keep state updated
  window.addEventListener("beforeunload", () => saveLikes(state));
}
