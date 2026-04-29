(function () {
  "use strict";

  // ═══════════════════════════════════════════
  // HAMBURGER MENU
  // ═══════════════════════════════════════════

  const hamburger = document.getElementById("hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Fermer le menu au clic sur un lien
    navMenu.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      }
    });
  }

  // ═══════════════════════════════════════════
  // CAROUSEL
  // ═══════════════════════════════════════════
  const track = document.getElementById("carouselTrack");
  const wrapper = document.getElementById("carouselWrapper");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const dots = document.querySelectorAll(".control-dot");

  // Configuration
  const CONFIG = {
    cardWidth: 320,
    gap: 24,
    totalCards: 5,
    speed: 0.5, // px par frame (~30px/s à 60fps)
  };

  const SLIDE_WIDTH = CONFIG.cardWidth + CONFIG.gap;
  const TOTAL_WIDTH = SLIDE_WIDTH * CONFIG.totalCards; // largeur d'un set complet (5 slides)

  // ═══════════════════════════════════════════
  // CLONAGE POUR EFFET INFINI
  // ═══════════════════════════════════════════

  function cloneCards() {
    const cards = Array.from(track.children);
    // On clone les 5 cartes une fois → 10 éléments au total
    // Le JS anime de 0 à -TOTAL_WIDTH puis repart à 0 de manière invisible
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  }

  // ═══════════════════════════════════════════
  // ÉTAT
  // ═══════════════════════════════════════════

  let position = 0; // offset translateX courant en px
  let isPaused = false;

  // ═══════════════════════════════════════════
  // RENDU
  // ═══════════════════════════════════════════

  function applyPosition() {
    track.style.transform = `translateX(-${position}px)`;
  }

  // ═══════════════════════════════════════════
  // BOUCLE INFINIE (requestAnimationFrame)
  // ═══════════════════════════════════════════
  /*
    FIX : l'animation CSS et style.transform manuel se battaient — la CSS
    écrasait le transform appliqué par goToSlide() lors de sa reprise,
    causant un saut brutal. On pilote maintenant TOUT via rAF.
  */
  function animate() {
    if (!isPaused) {
      position += CONFIG.speed;

      // Reset invisible : on a défilé exactement un set complet (5 slides)
      if (position >= TOTAL_WIDTH) {
        position -= TOTAL_WIDTH;
      }

      applyPosition();
      updateDots(Math.round(position / SLIDE_WIDTH) % CONFIG.totalCards);
    }

    requestAnimationFrame(animate);
  }

  // ═══════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════

  function goToSlide(index) {
    const target =
      ((index % CONFIG.totalCards) + CONFIG.totalCards) % CONFIG.totalCards;
    position = target * SLIDE_WIDTH;
    applyPosition();
    updateDots(target);
  }

  function next() {
    const current = Math.round(position / SLIDE_WIDTH) % CONFIG.totalCards;
    goToSlide(current + 1);
  }

  function prev() {
    const current = Math.round(position / SLIDE_WIDTH) % CONFIG.totalCards;
    goToSlide(current - 1);
  }

  // ═══════════════════════════════════════════
  // DOTS
  // ═══════════════════════════════════════════
  /*
    FIX : les dots n'étaient jamais mis à jour pendant le défilement auto.
    Maintenant updateDots() est appelé à chaque frame depuis animate().
  */
  function updateDots(index) {
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  function syncDotsWithNavigation() {
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => goToSlide(index));
    });
  }

  // ═══════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════

  function setupEventListeners() {
    btnPrev.addEventListener("click", prev);
    btnNext.addEventListener("click", next);

    // Pause au survol — géré ici, plus besoin de CSS animation-play-state
    wrapper.addEventListener("mouseenter", () => {
      isPaused = true;
    });

    wrapper.addEventListener("mouseleave", () => {
      isPaused = false;
    });
  }

  // ═══════════════════════════════════════════
  // INITIALISATION
  // ═══════════════════════════════════════════

  function init() {
    cloneCards();
    setupEventListeners();
    syncDotsWithNavigation();
    updateDots(0);
    requestAnimationFrame(animate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
