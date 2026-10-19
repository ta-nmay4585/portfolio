const scene = document.getElementById("code-card-scene");
const heroStage = document.querySelector(".hero-stage");
const sceneCore = scene?.querySelector(".scene-core");
const targetGrid = document.getElementById("skill-card-grid");
const skillsHeading = document.querySelector("#skills .section-heading");
const sourceCards = scene ? [...scene.querySelectorAll(".code-card")] : [];
const targetCards = targetGrid ? [...targetGrid.querySelectorAll(".skill-card")] : [];
const centerBadge = scene?.querySelector(".scene-center");
const scrollLabel = document.querySelector(".stage-note");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const desktop = window.matchMedia("(min-width: 768px)");

const birdFormation = [
  [-144, -70, -36],
  [-112, -43, -28],
  [-80, -16, -20],
  [-48, 11, -12],
  [-16, 31, -4],
  [16, 31, 4],
  [48, 11, 12],
  [80, -16, 20],
  [112, -43, 28],
  [144, -70, 36]
];

const birdCardSize = { width: 88, height: 112 };
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
  const startLine = window.innerHeight * 0.98;
  const endLine = window.innerHeight * 0.15;
  return ease(clamp((startLine - headingTop) / (startLine - endLine)));
}

function updateHandoff() {
  frameId = null;
  if (!handoffEnabled) return;

  const progress = getProgress();
  const gatherEnd = 0.38;
  const travelEnd = 0.74;
  const groupTravel = ease(clamp((progress - gatherEnd) / (travelEnd - gatherEnd)));
  const crossfade = clamp((progress - 0.88) / 0.12);
  const sourceOpacity = 1 - clamp(progress / 0.14);
  const travelFadeIn = clamp(progress / 0.14);

  targetGrid.style.transform = `translateY(${(1 - progress) * 42}px)`;
  targetGrid.style.opacity = crossfade.toFixed(3);

  if (centerBadge) {
    const opacity = 1 - clamp(progress / 0.16);
    centerBadge.style.opacity = opacity.toFixed(3);
    centerBadge.style.transform = `translate(-50%, -50%) scale(${0.82 + opacity * 0.18})`;
  }

  if (scrollLabel) {
    const opacity = 1 - clamp(progress / 0.12);
    scrollLabel.style.opacity = opacity.toFixed(3);
    scrollLabel.style.transform = `translateY(${(1 - opacity) * 10}px)`;
  }

  sourceCards.forEach((card) => {
    card.style.opacity = sourceOpacity.toFixed(3);
  });

  const stageRect = heroStage.getBoundingClientRect();
  const gridRect = targetGrid.getBoundingClientRect();
  const fanCenter = {
    x: stageRect.left + stageRect.width / 2,
    y: stageRect.top + stageRect.height / 2
  };
  const gridCenter = {
    x: gridRect.left + gridRect.width / 2,
    y: gridRect.top + gridRect.height / 2
  };
  const formationCenter = {
    x: mix(fanCenter.x, gridCenter.x, groupTravel),
    y: mix(fanCenter.y, gridCenter.y, groupTravel)
  };
  const sceneScale = Number.parseFloat(
    getComputedStyle(sceneCore).getPropertyValue("--scene-scale")
  ) || 1;

  sourceCards.forEach((sourceCard, index) => {
    const travelCard = travelCards[index];
    const targetCard = targetCards[index];
    const formation = birdFormation[index];
    if (!travelCard || !targetCard || !formation) return;

    const sourceRect = sourceCard.getBoundingClientRect();
    const targetRect = targetCard.getBoundingClientRect();
    const sourceCenterX = sourceRect.left + sourceRect.width / 2;
    const sourceCenterY = sourceRect.top + sourceRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const startAngle = Number.parseFloat(
      getComputedStyle(sourceCard).getPropertyValue("--r")
    ) || 0;
    const gatherDelay = index * 0.012;
    const gather = ease(clamp((progress - gatherDelay) / 0.26));
    const land = ease(clamp((progress - travelEnd) / (1 - travelEnd)));
    const birdX = formationCenter.x + formation[0];
    const birdY = formationCenter.y + formation[1];
    const gatheredX = mix(sourceCenterX, birdX, gather);
    const gatheredY = mix(sourceCenterY, birdY, gather);
    const sourceWidth = sourceCard.offsetWidth * sceneScale;
    const sourceHeight = sourceCard.offsetHeight * sceneScale;
    const gatheredWidth = mix(sourceWidth, birdCardSize.width, gather);
    const gatheredHeight = mix(sourceHeight, birdCardSize.height, gather);
    const gatheredRotation = mix(startAngle, formation[2], gather);
    const centerX = mix(gatheredX, targetCenterX, land);
    const centerY = mix(gatheredY, targetCenterY, land);
    const width = mix(gatheredWidth, targetRect.width, land);
    const height = mix(gatheredHeight, targetRect.height, land);
    const rotation = mix(gatheredRotation, 0, land);
    const opacity = travelFadeIn * (1 - crossfade);

    travelCard.style.left = `${centerX - width / 2}px`;
    travelCard.style.top = `${centerY - height / 2}px`;
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
  targetGrid?.style.removeProperty("transform");
  centerBadge?.style.removeProperty("opacity");
  centerBadge?.style.removeProperty("transform");
  scrollLabel?.style.removeProperty("opacity");
  scrollLabel?.style.removeProperty("transform");
  removeTravelCards();
}

function configureHandoff() {
  const canAnimate =
    scene &&
    heroStage &&
    sceneCore &&
    targetGrid &&
    skillsHeading &&
    sourceCards.length === 10 &&
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

if (scene && heroStage && targetGrid && skillsHeading) {
  scene.classList.add("is-visible");
  configureHandoff();

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", configureHandoff);
  desktop.addEventListener("change", configureHandoff);
  reducedMotion.addEventListener("change", configureHandoff);
  window.addEventListener("load", scheduleUpdate, { once: true });
}
