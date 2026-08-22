const slideshows = {
  main: {
    frames: [
      "main_animation/LPU-Anim.png",
      ...Array.from({ length: 44 }, (_, index) => `main_animation/LPU-Anim-${index + 2}.png`),
    ],
    interval: 650,
    alt: (index) => `LPU Lite forward-pass architecture, frame ${index + 1}`,
  },
  comparison: {
    frames: ["draft1-originals/sysarray.png", "draft1-originals/mxm4x4.png"],
    titles: ["Systolic array", "LPU Lite MXM"],
    alt: (index) => index === 0 ? "Systolic array wiring" : "LPU Lite MXM wiring",
  },
  mxm: {
    frames: [
      "LPU-Lite-assets/mxm_anim/mxm_anim.png",
      ...Array.from({ length: 5 }, (_, index) => `LPU-Lite-assets/mxm_anim/mxm_anim-${index + 2}.png`),
    ],
    interval: 850,
    alt: (index) => `MXM animation frame ${index + 1}`,
  },
  "vxm-v2": {
    frames: ["vxm-v2-anim/vxm-v2.png", ...Array.from({ length: 3 }, (_, index) => `vxm-v2-anim/vxm-v2-${index + 2}.png`)],
    interval: 900,
    alt: (index) => `VXM v2 pipeline animation frame ${index + 1}`,
  },
  chunking: {
    frames: ["chunking-anim/chunking.png", ...Array.from({ length: 15 }, (_, index) => `chunking-anim/chunking-${index + 2}.png`)],
    interval: 750,
    alt: (index) => `RMSNorm chunking animation frame ${index + 1}`,
  },
  buffering: {
    frames: ["buffering-anim/buffering-mxm.png", ...Array.from({ length: 4 }, (_, index) => `buffering-anim/buffering-mxm-${index + 2}.png`)],
    interval: 850,
    alt: (index) => `MXM double buffering animation frame ${index + 1}`,
  },
};

function setupSlideshow(root) {
  const config = slideshows[root.dataset.slideshow];
  const image = root.querySelector(".slide-stage img");
  const title = root.querySelector("[data-title]");
  const count = root.querySelector("[data-count]");
  const playButton = root.querySelector('[data-action="play"]');
  let index = 0;
  let timer = null;

  function preload(nextIndex) {
    const preloadImage = new Image();
    preloadImage.src = config.frames[nextIndex];
  }

  function render(nextIndex) {
    index = (nextIndex + config.frames.length) % config.frames.length;
    image.src = config.frames[index];
    image.alt = config.alt(index);
    if (title) title.textContent = config.titles[index];
    if (count) count.textContent = `${index + 1} / ${config.frames.length}`;
    preload((index + 1) % config.frames.length);
  }

  function stop() {
    window.clearInterval(timer);
    timer = null;
    if (playButton) {
      playButton.classList.remove("is-playing");
      playButton.setAttribute("aria-label", "Play animation");
    }
  }

  function togglePlay() {
    if (timer) return stop();
    playButton.classList.add("is-playing");
    playButton.setAttribute("aria-label", "Pause animation");
    timer = window.setInterval(() => {
      if (index === config.frames.length - 1) return stop();
      render(index + 1);
    }, config.interval);
  }

  root.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "next") render(index + 1);
    if (action === "previous") render(index - 1);
    if (action === "play") togglePlay();
    if (action === "reset") { stop(); render(0); }
  });

  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
  render(0);
}

document.querySelectorAll("[data-slideshow]").forEach(setupSlideshow);
