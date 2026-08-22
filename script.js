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

const microGPTPredictionTree = {
  ya: [
    { token: "s", probability: 45 },
    { token: "n", probability: 35 },
    { token: "m", probability: 12 },
    { token: "r", probability: 8 },
  ],
  yas: [
    { token: "h", probability: 82 },
    { token: "m", probability: 8 },
    { token: "i", probability: 6 },
    { token: "a", probability: 4 },
  ],
  yan: [
    { token: "n", probability: 76 },
    { token: "i", probability: 11 },
    { token: "a", probability: 8 },
    { token: "e", probability: 5 },
  ],
  yann: [
    { token: "i", probability: 84 },
    { token: "a", probability: 7 },
    { token: "e", probability: 5 },
    { token: "o", probability: 4 },
  ],
  yanni: [
    { token: "c", probability: 89 },
    { token: "k", probability: 5 },
    { token: "e", probability: 4 },
    { token: "a", probability: 2 },
  ],
  yannic: [
    { token: "k", probability: 96 },
    { token: "a", probability: 2 },
    { token: "e", probability: 1 },
    { token: "h", probability: 1 },
  ],
  yam: [
    { token: "i", probability: 68 },
    { token: "a", probability: 14 },
    { token: "n", probability: 10 },
    { token: "o", probability: 8 },
  ],
  yami: [
    { token: "n", probability: 83 },
    { token: "l", probability: 7 },
    { token: "r", probability: 6 },
    { token: "s", probability: 4 },
  ],
  yamin: [
    { token: "i", probability: 91 },
    { token: "a", probability: 4 },
    { token: "e", probability: 3 },
    { token: "o", probability: 2 },
  ],
  yar: [
    { token: "a", probability: 65 },
    { token: "i", probability: 18 },
    { token: "o", probability: 10 },
    { token: "e", probability: 7 },
  ],
};

const microGPTMessages = {
  ya: "The prefix “Ya” can lead to several names. The model ranks “s” first, but “n” is also plausible.",
  yas: "After choosing “s,” the new context strongly favors “h,” steering the name toward “Yash.”",
  yan: "Plot twist: choosing “n” changed the context. A second “n” now dominates, steering the name toward “Yannick.”",
  yann: "With “Yann” as context, “i” becomes the strongest next-character prediction.",
  yanni: "After “Yanni,” the probability distribution shifts again and strongly favors “c.”",
  yannic: "With “Yannic” already generated, “k” is now overwhelmingly likely.",
  yam: "The “m” branch makes “i” the most likely continuation, opening a path toward “Yamini.”",
  yami: "With “Yami” as context, “n” becomes the dominant next character.",
  yamin: "The context “Yamin” makes a final “i” overwhelmingly likely.",
  yar: "The “r” branch shifts the probabilities toward “a,” opening a path toward “Yara.”",
};

function setupMicroGPTDemo(root) {
  const generatedName = root.querySelector("[data-generated-name]");
  const message = root.querySelector("[data-demo-message]");
  const step = root.querySelector("[data-demo-step]");
  const tokenGrid = root.querySelector("[data-token-grid]");
  const tokenHeading = root.querySelector(".token-heading");
  let prefix = "ya";

  function formatName(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function renderToken(option, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `token-option${index === 0 ? " is-highest" : ""}`;
    button.dataset.token = option.token;
    button.setAttribute("aria-label", `Choose ${option.token}, ${option.probability.toFixed(1)} percent probability${index === 0 ? ", highest probability" : ""}`);

    const header = document.createElement("span");
    header.className = "token-option-header";

    const character = document.createElement("span");
    character.className = "token-character";
    character.textContent = option.token;

    const rank = document.createElement("span");
    rank.className = "token-rank";
    rank.textContent = `#${index + 1}`;

    const probability = document.createElement("span");
    probability.className = "token-probability";
    probability.textContent = `${option.probability.toFixed(1)}%`;

    const bar = document.createElement("span");
    bar.className = "token-bar";

    const fill = document.createElement("span");
    fill.className = "token-bar-fill";
    fill.style.width = `${option.probability}%`;

    header.append(character, rank);
    bar.append(fill);
    button.append(header, probability, bar);
    return button;
  }

  function render() {
    const predictions = microGPTPredictionTree[prefix];
    generatedName.textContent = formatName(prefix);
    tokenGrid.replaceChildren();

    if (!predictions) {
      root.classList.add("is-complete");
      step.textContent = "";
      message.textContent = "";
      return;
    }

    root.classList.remove("is-complete");
    step.textContent = `Step ${prefix.length - 1}`;
    message.textContent = microGPTMessages[prefix] || "The characters already generated change which character is most likely to come next.";
    tokenHeading.querySelector("span:first-child").textContent = "Choose the next letter";
    tokenHeading.querySelector("span:last-child").textContent = "Four possibilities";
    predictions.forEach((option, index) => tokenGrid.append(renderToken(option, index)));
  }

  root.addEventListener("click", (event) => {
    const resetButton = event.target.closest("[data-microgpt-reset]");
    if (resetButton) {
      prefix = "ya";
      render();
      return;
    }

    const tokenButton = event.target.closest("[data-token]");
    if (!tokenButton) return;
    prefix += tokenButton.dataset.token;
    render();
  });

  render();
}

document.querySelectorAll("[data-microgpt-demo]").forEach(setupMicroGPTDemo);
