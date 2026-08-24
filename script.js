const animationFrameInterval = 1500;

const slideshows = {
  main: {
    frames: [
      "main_animation/LPU-Anim.png",
      ...Array.from({ length: 44 }, (_, index) => `main_animation/LPU-Anim-${index + 2}.png`),
    ],
    interval: animationFrameInterval,
    alt: (index) => `LPU Lite forward-pass architecture, frame ${index + 1}`,
  },
  comparison: {
    frames: ["draft1-originals/sysarray.png", "draft1-originals/mxm4x4.png"],
    titles: ["Systolic array", "LPU Lite MXM"],
    interval: animationFrameInterval,
    alt: (index) => index === 0 ? "Systolic array wiring" : "LPU Lite MXM wiring",
  },
  mxm: {
    frames: [
      "LPU-Lite-assets/mxm_anim/mxm_anim.png",
      ...Array.from({ length: 5 }, (_, index) => `LPU-Lite-assets/mxm_anim/mxm_anim-${index + 2}.png`),
    ],
    interval: animationFrameInterval,
    alt: (index) => `MXM animation frame ${index + 1}`,
  },
  "vxm-v2": {
    frames: ["vxm-v2-anim/vxm-v2.png", ...Array.from({ length: 3 }, (_, index) => `vxm-v2-anim/vxm-v2-${index + 2}.png`)],
    interval: animationFrameInterval,
    alt: (index) => `VXM v2 pipeline animation frame ${index + 1}`,
  },
  "vxm-v2-full": {
    frames: ["vxm-v2-full.png", ...Array.from({ length: 13 }, (_, index) => `vxm-v2-full-anim/vxm-v2-full-${index + 2}.png`)],
    interval: animationFrameInterval,
    alt: (index) => `Full VXM v2 animation frame ${index + 1}`,
  },
  rmsnorm: {
    frames: ["rmsnorm-anim/rmsnorm.png", ...Array.from({ length: 19 }, (_, index) => `rmsnorm-anim/rmsnorm-${index + 2}.png`)],
    interval: animationFrameInterval,
    alt: (index) => `RMSNorm animation frame ${index + 1}`,
  },
  chunking: {
    frames: ["chunking-anim/chunking.png", ...Array.from({ length: 15 }, (_, index) => `chunking-anim/chunking-${index + 2}.png`)],
    interval: animationFrameInterval,
    alt: (index) => `RMSNorm chunking animation frame ${index + 1}`,
  },
  buffering: {
    frames: ["buffering-anim/buffering-mxm.png", ...Array.from({ length: 4 }, (_, index) => `buffering-anim/buffering-mxm-${index + 2}.png`)],
    interval: animationFrameInterval,
    alt: (index) => `MXM double buffering animation frame ${index + 1}`,
  },
  softmax: {
    frames: ["softmax-anim/softmax.png", ...Array.from({ length: 26 }, (_, index) => `softmax-anim/softmax-${index + 2}.png`)],
    interval: animationFrameInterval,
    alt: (index) => `Softmax animation frame ${index + 1}`,
  },
  rope: {
    frames: ["rope-anim/rope.png", ...Array.from({ length: 18 }, (_, index) => `rope-anim/rope-${index + 2}.png`)],
    interval: animationFrameInterval,
    alt: (index) => `RoPE animation frame ${index + 1}`,
  },
};

function setupSlideshow(root) {
  const config = slideshows[root.dataset.slideshow];
  const stage = root.querySelector(".slide-stage");
  const image = root.querySelector(".slide-stage > img");
  const title = root.querySelector("[data-title]");
  const count = root.querySelector("[data-count]");
  const playButton = root.querySelector('[data-action="play"]');
  const controls = root.querySelector(".slide-controls");
  const controlCount = document.createElement("span");
  controlCount.className = "control-frame-count";
  controlCount.setAttribute("aria-live", "polite");
  playButton.insertAdjacentElement("afterend", controlCount);

  let index = 0;
  let timer = null;
  let queuedFrame = null;

  function normalizedIndex(nextIndex) {
    return (nextIndex + config.frames.length) % config.frames.length;
  }

  function preload(nextIndex) {
    const frameIndex = normalizedIndex(nextIndex);
    if (queuedFrame?.index === frameIndex) return queuedFrame.promise;
    const preloadImage = new Image();
    const promise = new Promise((resolve) => {
      preloadImage.addEventListener("load", resolve, { once: true });
      preloadImage.addEventListener("error", resolve, { once: true });
    });
    queuedFrame = { index: frameIndex, image: preloadImage, promise };
    preloadImage.src = config.frames[frameIndex];
    return promise;
  }

  function render(nextIndex) {
    index = normalizedIndex(nextIndex);
    image.src = config.frames[index];
    image.alt = config.alt(index);
    if (title && config.titles) title.textContent = config.titles[index];
    if (count) count.textContent = `${index + 1} / ${config.frames.length}`;
    controlCount.textContent = `${index + 1} / ${config.frames.length}`;
    controlCount.setAttribute("aria-label", `Frame ${index + 1} of ${config.frames.length}`);
    magnifier?.updateFrame(config.frames[index]);
    preload((index + 1) % config.frames.length);
  }

  function stop() {
    window.clearTimeout(timer);
    timer = null;
    if (playButton) {
      playButton.classList.remove("is-playing");
      playButton.setAttribute("aria-label", "Play animation");
    }
  }

  async function playNextFrame() {
    const nextIndex = index + 1;
    await preload(nextIndex);
    if (timer === null) return;
    render(nextIndex);
    if (index === config.frames.length - 1) {
      stop();
      return;
    }
    timer = window.setTimeout(playNextFrame, config.interval);
  }

  function togglePlay() {
    if (timer) return stop();
    if (index === config.frames.length - 1) render(0);
    playButton.classList.add("is-playing");
    playButton.setAttribute("aria-label", "Pause animation");
    timer = window.setTimeout(playNextFrame, config.interval);
  }

  function setupMagnifier() {
    if (root.dataset.slideshow !== "main") return null;
    const toggle = controls.querySelector('[data-action="magnify"]');
    if (!toggle) return null;

    const lens = document.createElement("span");
    lens.className = "magnifier-lens";
    lens.setAttribute("aria-hidden", "true");
    const lensImage = document.createElement("img");
    lensImage.alt = "";
    lensImage.draggable = false;
    const prompt = document.createElement("span");
    prompt.className = "magnifier-prompt";
    prompt.textContent = "Click the animation to choose an area";
    const moveLabel = document.createElement("span");
    moveLabel.className = "magnifier-move-label";
    moveLabel.textContent = "Drag to move";
    lens.append(lensImage, prompt, moveLabel);
    stage.append(lens);

    const state = { enabled: false, point: null, panelPosition: null };
    const zoomLevel = () => window.matchMedia("(max-width: 700px)").matches ? 2 : 1.75;
    const defaultStageLabel = stage.getAttribute("aria-label");
    let drag = null;

    function positionPanel() {
      if (!state.panelPosition) {
        lens.style.removeProperty("top");
        lens.style.removeProperty("left");
        lens.style.removeProperty("bottom");
        return;
      }
      const stageRect = stage.getBoundingClientRect();
      const maxLeft = Math.max(0, stageRect.width - lens.offsetWidth);
      const maxTop = Math.max(0, stageRect.height - lens.offsetHeight);
      lens.style.left = `${state.panelPosition.x * maxLeft}px`;
      lens.style.top = `${state.panelPosition.y * maxTop}px`;
      lens.style.bottom = "auto";
    }

    function showAt(normalizedX, normalizedY) {
      const imageRect = image.getBoundingClientRect();
      if (!imageRect.width || !imageRect.height) return;

      const selectedX = Math.min(1, Math.max(0, normalizedX));
      const selectedY = Math.min(1, Math.max(0, normalizedY));
      const x = selectedX * imageRect.width;
      const y = selectedY * imageRect.height;
      const lensWidth = lens.offsetWidth;
      const lensHeight = lens.offsetHeight;
      const zoom = zoomLevel();

      lensImage.style.width = `${imageRect.width * zoom}px`;
      lensImage.style.height = `${imageRect.height * zoom}px`;
      lensImage.style.left = `${lensWidth / 2 - x * zoom}px`;
      lensImage.style.top = `${lensHeight / 2 - y * zoom}px`;
      lens.classList.add("is-visible");
      lens.classList.remove("is-awaiting-selection");
      state.point = { x: selectedX, y: selectedY };
    }

    function showFromPointer(event) {
      const imageRect = image.getBoundingClientRect();
      const x = (event.clientX - imageRect.left) / imageRect.width;
      const y = (event.clientY - imageRect.top) / imageRect.height;
      showAt(x, y);
    }

    function setEnabled(enabled) {
      state.enabled = enabled;
      root.classList.toggle("is-magnifier-enabled", enabled);
      toggle.setAttribute("aria-pressed", String(enabled));
      toggle.setAttribute("aria-label", enabled ? "Turn off animation zoom panel" : "Select an animation area to zoom");
      stage.setAttribute("aria-label", enabled ? "Select an area to magnify" : defaultStageLabel);
      if (enabled) {
        lens.classList.add("is-visible");
        positionPanel();
        if (state.point) showAt(state.point.x, state.point.y);
        else lens.classList.add("is-awaiting-selection");
      } else {
        lens.classList.remove("is-visible");
        lens.classList.remove("is-awaiting-selection");
      }
    }

    stage.addEventListener("pointerdown", (event) => {
      if (!state.enabled || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.preventDefault();
      showFromPointer(event);
    });

    lens.addEventListener("pointerdown", (event) => {
      if (!state.enabled || (event.pointerType === "mouse" && event.button !== 0)) return;
      event.preventDefault();
      event.stopPropagation();
      const stageRect = stage.getBoundingClientRect();
      const lensRect = lens.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startLeft: lensRect.left - stageRect.left,
        startTop: lensRect.top - stageRect.top,
      };
      lens.style.left = `${drag.startLeft}px`;
      lens.style.top = `${drag.startTop}px`;
      lens.style.bottom = "auto";
      lens.classList.add("is-dragging");
      lens.setPointerCapture(event.pointerId);
    });

    lens.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      const stageRect = stage.getBoundingClientRect();
      const maxLeft = Math.max(0, stageRect.width - lens.offsetWidth);
      const maxTop = Math.max(0, stageRect.height - lens.offsetHeight);
      const left = Math.min(maxLeft, Math.max(0, drag.startLeft + event.clientX - drag.startX));
      const top = Math.min(maxTop, Math.max(0, drag.startTop + event.clientY - drag.startY));
      lens.style.left = `${left}px`;
      lens.style.top = `${top}px`;
      state.panelPosition = {
        x: maxLeft ? left / maxLeft : 0,
        y: maxTop ? top / maxTop : 0,
      };
    });

    function endDrag(event) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      event.preventDefault();
      event.stopPropagation();
      drag = null;
      lens.classList.remove("is-dragging");
    }

    lens.addEventListener("pointerup", endDrag);
    lens.addEventListener("pointercancel", endDrag);
    lens.addEventListener("lostpointercapture", endDrag);
    lens.addEventListener("click", (event) => {
      if (!state.enabled) return;
      event.preventDefault();
      event.stopPropagation();
    });
    window.addEventListener("resize", () => {
      if (!state.enabled) return;
      requestAnimationFrame(() => {
        positionPanel();
        if (state.point) showAt(state.point.x, state.point.y);
      });
    });

    return {
      get enabled() { return state.enabled; },
      toggle() { setEnabled(!state.enabled); },
      updateFrame(source) {
        lensImage.src = source;
        if (state.enabled && state.point) requestAnimationFrame(() => showAt(state.point.x, state.point.y));
      },
    };
  }

  const magnifier = setupMagnifier();

  root.addEventListener("click", (event) => {
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "magnify") {
      magnifier?.toggle();
      return;
    }
    if (magnifier?.enabled && action === "next" && event.target.closest(".slide-stage")) return;
    if (action === "next") { stop(); render(index + 1); }
    if (action === "previous") { stop(); render(index - 1); }
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
