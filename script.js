const scene = document.getElementById("code-card-scene");
const sceneCore = scene?.querySelector(".scene-core");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      const sceneRect = scene.getBoundingClientRect();
      const distance = Math.max(0, Math.min(1, (window.innerHeight - sceneRect.top) / window.innerHeight));
      sceneCore.style.setProperty("--scene-offset", `${distance * -16}px`);
      sceneCore.style.setProperty("--scene-turn", `${distance * 2}deg`);
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
