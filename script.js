const scene = document.getElementById("code-card-scene");
const targetGrid = document.getElementById("skill-card-grid");
const skillsHeading = document.querySelector("#skills .section-heading");
const sourceCards = scene ? [...scene.querySelectorAll(".code-card")] : [];
const targetCards = targetGrid ? [...targetGrid.querySelectorAll(".skill-card")] : [];
const centerBadge = scene?.querySelector(".scene-center");
const scrollLabel = document.querySelector(".stage-note");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop = window.matchMedia("(min-width: 768px)");

let travelLayer;
let travelCards = [];
let frameId = null;
let handoffEnabled = false;

const clamp = (value) => Math.min(1, Math.max(0, value));
const mix = (start, end, amount) => start + (end - start) * amount;
const ease = (amount) => amount * amount * (3 - 2 * amount);

function createTravelCards() {
  if (travelLayer) return;

  travelLayer = document.createElement("div");
  travelLayer.className = "card-travel-layer";
  travelLayer.setAttribute("aria-hidden", "true");

  travelCards = sourceCards.map((sourceCard, index) => {
    const color = ["yellow", "orange", "blue", "coral", "peach"].find((name) =>
      sourceCard.classList.contains(name)
    );
    const travelCard = document.createElement("div");
    travelCard.className = `travel-card ${color}`;
    travelCard.style.zIndex = String(30 + index);
    travelCard.append(sourceCard.querySelector(".code-card-inner").cloneNode(true));
    travelLayer.append(travelCard);
    return travelCard;
  });

  document.body.append(travelLayer);
}

function removeTravelCards() {
  travelLayer?.remove();
  travelLayer = null;
  travelCards = [];
}

function getProgress() {
  const headingTop = skillsHeading.getBoundingClientRect().top;
  const startLine = window.innerHeight * 0.88;
  const endLine = window.innerHeight * 0.18;
  return ease(clamp((startLine - headingTop) / (startLine - endLine)));
}

function updateHandoff() {
  frameId = null;
  if (!handoffEnabled) return;

  const progress = getProgress();
  const sourceOpacity = 1 - clamp(progress / 0.18);
  const travelFadeIn = clamp(progress / 0.08);
  const travelFadeOut = 1 - clamp((progress - 0.78) / 0.22);
  const gridOpacity = clamp((progress - 0.78) / 0.22);

  sourceCards.forEach((card) => {
    card.style.opacity = sourceOpacity.toFixed(3);
  });
  targetGrid.style.opacity = gridOpacity.toFixed(3);

  if (centerBadge) {
    const opacity = 1 - clamp(progress / 0.18);
    centerBadge.style.opacity = opacity.toFixed(3);
    centerBadge.style.transform = `translate(-50%, -50%) scale(${0.82 + opacity * 0.18})`;
  }

  if (scrollLabel) {
    const opacity = 1 - clamp(progress / 0.15);
    scrollLabel.style.opacity = opacity.toFixed(3);
    scrollLabel.style.transform = `translateY(${(1 - opacity) * 10}px)`;
  }

  sourceCards.forEach((sourceCard, index) => {
    const travelCard = travelCards[index];
    const targetCard = targetCards[index];
    if (!travelCard || !targetCard) return;

    const sourceRect = sourceCard.getBoundingClientRect();
    const targetRect = targetCard.getBoundingClientRect();
    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const startAngle = Number.parseFloat(
      getComputedStyle(sourceCard).getPropertyValue("--angle")
    ) || 0;
    const width = mix(sourceCard.offsetWidth, targetRect.width, progress);
    const height = mix(sourceCard.offsetHeight, targetRect.height, progress);
    const left = mix(sourceCenterX, targetCenterX, progress) - width / 2;
    const top = mix(sourceCenterY, targetCenterY, progress) - height / 2;
    const rotation = mix(startAngle, 0, progress);
    const opacity = travelFadeIn * travelFadeOut;

    travelCard.style.left = `${left}px`;
    travelCard.style.top = `${top}px`;
    travelCard.style.width = `${width}px`;
    travelCard.style.height = `${height}px`;
    travelCard.style.opacity = opacity.toFixed(3);
    travelCard.style.transform = `rotate(${rotation}deg)`;
  });
}

function scheduleUpdate() {
  if (frameId === null) {
    frameId = requestAnimationFrame(updateHandoff);
  }
}

function resetStaticLayout() {
  handoffEnabled = false;
  document.body.classList.remove("cards-animated");
  sourceCards.forEach((card) => card.style.removeProperty("opacity"));
  targetGrid?.style.removeProperty("opacity");
  centerBadge?.style.removeProperty("opacity");
  centerBadge?.style.removeProperty("transform");
  scrollLabel?.style.removeProperty("opacity");
  scrollLabel?.style.removeProperty("transform");
  removeTravelCards();
}

function configureHandoff() {
  const canAnimate =
    scene &&
    targetGrid &&
    skillsHeading &&
    sourceCards.length === 9 &&
    targetCards.length === sourceCards.length &&
    desktop.matches &&
    !reducedMotion.matches;

  if (!canAnimate) {
    resetStaticLayout();
    return;
  }

  handoffEnabled = true;
  document.body.classList.add("cards-animated");
  scene.classList.add("is-visible");
  createTravelCards();
  scheduleUpdate();
}

if (scene && targetGrid && skillsHeading) {
  scene.classList.add("is-visible");
  configureHandoff();

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", configureHandoff);
  desktop.addEventListener("change", configureHandoff);
  reducedMotion.addEventListener("change", configureHandoff);
  window.addEventListener("load", scheduleUpdate, { once: true });
}
