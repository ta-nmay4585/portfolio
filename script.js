const scene = document.getElementById("code-card-scene");
const heroStage = document.querySelector(".hero-stage");
const skillsSection = document.getElementById("skills");
const skillsHeading = skillsSection?.querySelector(".section-heading");
const targetGrid = document.getElementById("skill-card-grid");
const sourceCards = scene ? [...scene.querySelectorAll(".code-card")] : [];
const targetCards = targetGrid ? [...targetGrid.querySelectorAll(".skill-card")] : [];
const centerBadge = scene?.querySelector(".scene-center");
const scrollLabel = document.querySelector(".stage-note");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop = window.matchMedia("(min-width: 768px)");

let travelLayer;
let travelCards = [];
let animationFrame;
let animationIsActive = false;

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const mix = (start, end, amount) => start + (end - start) * amount;
const smoothstep = (amount) => amount * amount * (3 - 2 * amount);

function makeTravelCards() {
  if (travelLayer) return;

  travelLayer = document.createElement("div");
  travelLayer.className = "card-travel-layer";
  travelLayer.setAttribute("aria-hidden", "true");

  travelCards = sourceCards.map((sourceCard) => {
    const color = ["yellow", "orange", "blue", "coral", "peach"].find((name) =>
      sourceCard.classList.contains(name)
    );
    const card = document.createElement("div");
    card.className = `travel-card ${color}`;
    card.innerHTML = sourceCard.querySelector(".code-card-inner").outerHTML;
    travelLayer.append(card);
    return card;
  });

  document.body.append(travelLayer);
}

function removeTravelCards() {
  travelLayer?.remove();
  travelLayer = undefined;
  travelCards = [];
}

function transitionProgress() {
  const startLine = window.innerHeight * 0.86;
  const endLine = window.innerHeight * 0.18;
  const headingTop = skillsHeading.getBoundingClientRect().top;
  return clamp((startLine - headingTop) / (startLine - endLine));
}

function updateCardHandoff() {
  if (!animationIsActive) return;

  const rawProgress = transitionProgress();
  const progress = smoothstep(rawProgress);
  const sourceOpacity = 1 - clamp((progress - 0.03) / 0.19);
  const targetOpacity = clamp((progress - 0.66) / 0.34);
  const travellerOpacity = 1 - clamp((progress - 0.87) / 0.13);

  sourceCards.forEach((card) => {
    card.style.opacity = sourceOpacity.toFixed(3);
  });

  targetGrid.style.opacity = targetOpacity.toFixed(3);

  if (centerBadge) {
    const badgeFade = 1 - clamp((progress - 0.08) / 0.30);
    centerBadge.style.opacity = badgeFade.toFixed(3);
    centerBadge.style.transform = `translate(-50%, -50%) scale(${0.72 + badgeFade * 0.28})`;
  }

  if (scrollLabel) {
    const labelFade = 1 - clamp((progress - 0.06) / 0.24);
    scrollLabel.style.opacity = labelFade.toFixed(3);
    scrollLabel.style.transform = `translateY(${(1 - labelFade) * 12}px)`;
  }

  sourceCards.forEach((sourceCard, index) => {
    const traveller = travelCards[index];
    const targetCard = targetCards[index];
    if (!traveller || !targetCard) return;

    const sourceRect = sourceCard.getBoundingClientRect();
    const targetRect = targetCard.getBoundingClientRect();
    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const startRotation = Number.parseFloat(
      getComputedStyle(sourceCard).getPropertyValue("--r")
    ) || 0;
    const width = mix(sourceCard.offsetWidth, targetRect.width, progress);
    const height = mix(sourceCard.offsetHeight, targetRect.height, progress);

    traveller.style.left = `${mix(sourceCenterX, targetCenterX, progress) - width / 2}px`;
    traveller.style.top = `${mix(sourceCenterY, targetCenterY, progress) - height / 2}px`;
    traveller.style.width = `${width}px`;
    traveller.style.height = `${height}px`;
    traveller.style.opacity = travellerOpacity.toFixed(3);
    traveller.style.transform = `rotate(${mix(startRotation, 0, progress)}deg)`;
  });
}

function requestUpdate() {
  cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(updateCardHandoff);
}

function resetStaticLayout() {
  document.body.classList.remove("cards-animated");
  sourceCards.forEach((card) => {
    card.style.opacity = "";
  });
  targetGrid?.style.removeProperty("opacity");
  centerBadge?.style.removeProperty("opacity");
  centerBadge?.style.removeProperty("transform");
  scrollLabel?.style.removeProperty("opacity");
  scrollLabel?.style.removeProperty("transform");
  removeTravelCards();
}

function configureCardHandoff() {
  const canAnimate =
    scene &&
    heroStage &&
    skillsHeading &&
    targetGrid &&
    sourceCards.length === targetCards.length &&
    desktop.matches &&
    !prefersReducedMotion.matches;

  if (!canAnimate) {
    animationIsActive = false;
    resetStaticLayout();
    return;
  }

  animationIsActive = true;
  document.body.classList.add("cards-animated");
  scene.classList.add("is-visible");
  makeTravelCards();
  requestUpdate();
}

if (scene) {
  scene.classList.add("is-visible");
  configureCardHandoff();

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", configureCardHandoff);
  desktop.addEventListener("change", configureCardHandoff);
  prefersReducedMotion.addEventListener("change", configureCardHandoff);
}
