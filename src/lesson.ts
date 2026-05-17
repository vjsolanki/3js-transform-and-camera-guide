import type { Lesson } from "./types";
import { applyState, defaults } from "./state";

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as T;
};

const lessons: Lesson[] = [
  {
    title: "Welcome — what are the two viewports?",
    do: "Don't touch a slider yet. Just look. <b>Drag inside View #2</b> with your mouse to orbit around the scene.",
    watch:
      "View #1 shows a cube. View #2 shows the same cube AND a yellow pyramid pointing at it. <b>That yellow pyramid IS the camera.</b> View #1 is what that camera sees; View #2 is you watching the camera from outside.",
    state: defaults,
    highlight: [],
  },
  {
    title: "Object position — move the cube",
    do: "Drag <code>pos.x</code> slowly from 0 up to about 2.",
    watch:
      "Cube slides along the <b style=\"color:#f04d63\">red X axis</b>. The yellow pyramid (the camera) <b>doesn't move</b>. Only the cube did. <br><br><b>Lesson:</b> <code>cube.position</code> is the cube's location in the world. The camera doesn't care.",
    state: defaults,
    highlight: ["pos.x"],
  },
  {
    title: "Camera position — move the viewpoint",
    do: "Reset to defaults (or click the highlighted slider area). Then drag <code>cam.x</code> from 4 → 9.",
    watch:
      'In View #2 the <b style="color:#ffd34d">yellow pyramid slides outward</b>. The cube doesn\'t move. But in View #1 the cube shifts and shrinks — because <i>your viewpoint</i> moved.<br><br><b>Lesson:</b> changing camera position changes what you <i>see</i>, not what <i>exists</i>. This is the single most important camera idea.',
    state: defaults,
    highlight: ["cam.x"],
  },
  {
    title: "Rotation uses radians",
    do: "Drag <code>rot.y</code> slowly from 0 to about 3.14.",
    watch:
      "The cube spins around the green Y axis. The colored faces swap places. <code>3.14 ≈ π</code> is a half turn; <code>6.28 ≈ 2π</code> is a full turn.<br><br><b>Lesson:</b> Three.js uses radians, not degrees. <code>Math.PI / 2</code> is a quarter turn.",
    state: defaults,
    highlight: ["rot.y"],
  },
  {
    title: "camera.lookAt — aim the camera",
    do: "Drag <code>lookAt.y</code> from 0 to about 2.",
    watch:
      "In View #2: the yellow dot rises, the dashed line follows it, and the <b>whole yellow pyramid tilts upward</b>. In View #1: the cube falls toward the bottom of the frame — because the camera is now aimed at empty space above the cube.<br><br><b>Lesson:</b> <code>camera.lookAt(x, y, z)</code> rotates the camera so its forward direction points at that world coordinate.",
    state: defaults,
    highlight: ["lookAt.y"],
  },
  {
    title: "FOV — the 75 in PerspectiveCamera(75, ...)",
    do: "Drag <code>fov</code> from 75 down to about 15. Then drag it up to 110.",
    watch:
      "At <b>FOV 15</b> the yellow pyramid collapses into a narrow needle and the cube fills View #1 — same scene, but it looks like a telephoto lens. At <b>FOV 110</b> the pyramid opens wide and the cube looks small and distorted — like a fisheye lens.<br><br><b>Lesson:</b> FOV is the angular width of the lens. Nothing moved; only the lens changed.",
    state: { ...defaults, cam: { x: 6, y: 3, z: 8 } },
    highlight: ["fov"],
  },
  {
    title: "You have the vocabulary now",
    do: "Try the <b>Presets</b> below. Drag any slider. Combine moves — rotate the cube AND move the camera AND change FOV.",
    watch:
      "Every Object3D in Three.js works this way: <code>position</code>, <code>rotation</code>, <code>scale</code>. The camera is just an Object3D with one extra thing — a lens (FOV + aspect + near + far) that turns 3D into 2D.",
    state: defaults,
    highlight: [],
  },
];

export function initLesson() {
  const counter = $("lesson-counter");
  const title = $("lesson-title");
  const doEl = $("lesson-do");
  const watchEl = $("lesson-watch");
  const prev = $<HTMLButtonElement>("lesson-prev");
  const next = $<HTMLButtonElement>("lesson-next");

  let idx = 0;

  function render() {
    const L = lessons[idx]!;
    counter.textContent = `Step ${idx + 1} of ${lessons.length}`;
    title.textContent = L.title;
    doEl.innerHTML = L.do;
    watchEl.innerHTML = L.watch;
    prev.disabled = idx === 0;
    next.disabled = idx === lessons.length - 1;
    prev.style.opacity = idx === 0 ? "0.4" : "1";
    next.style.opacity = idx === lessons.length - 1 ? "0.4" : "1";

    applyState(L.state);

    for (const el of document.querySelectorAll<HTMLElement>(
      ".ctrl.highlight",
    )) {
      el.classList.remove("highlight");
    }
    for (const path of L.highlight) {
      const el = document.querySelector<HTMLElement>(
        `.ctrl[data-path="${path}"]`,
      );
      if (el) el.classList.add("highlight");
    }

    if (L.highlight.length) {
      const el = document.querySelector<HTMLElement>(
        `.ctrl[data-path="${L.highlight[0]}"]`,
      );
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  prev.onclick = () => {
    if (idx > 0) {
      idx--;
      render();
    }
  };
  next.onclick = () => {
    if (idx < lessons.length - 1) {
      idx++;
      render();
    }
  };
  render();
}
