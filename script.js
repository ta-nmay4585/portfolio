const scene = document.getElementById("code-card-scene");
const sceneCore = scene?.querySelector(".scene-core");
const cards = scene ? [...scene.querySelectorAll(".code-card")] : [];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cardMotion = [
  [-54, -30, -16],
  [-25, -52, -10],
  [18, -58, 2],
  [56, -30, 16],
  [70, -4, 18],
  [59, 42, 14],
  [23, 57, 9],
  [-20, 64, -7],
  [-60, 35, -16]
];

if (scene) {
  const revealScene = () => scene.classList.add("is-visible");

  if (prefersReducedMotion) {
    revealScene();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          revealScene();
          observer.disconnect();
        }
      },
      { threshold: 0.18 }
    );

    observer.observe(scene);

    let scheduled = false;
    const moveScene = () => {
      const scrollDistance = Math.max(520, scene.offsetHeight * 1.05);
      const progress = Math.max(0, Math.min(1, window.scrollY / scrollDistance));
      const easedProgress = 1 - (1 - progress) ** 2;

      sceneCore.style.setProperty("--scene-offset", `${easedProgress * -42}px`);
      sceneCore.style.setProperty("--scene-turn", `${easedProgress * 8}deg`);

      cards.forEach((card, index) => {
        const [x, y, turn] = cardMotion[index];
        card.style.setProperty("--scroll-x", `${x * easedProgress}px`);
        card.style.setProperty("--scroll-y", `${y * easedProgress}px`);
        card.style.setProperty("--scroll-r", `${turn * easedProgress}deg`);
      });

      scheduled = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!scheduled) {
          window.requestAnimationFrame(moveScene);
          scheduled = true;
        }
      },
      { passive: true }
    );

    moveScene();
  }
}
