import type { Axis, Preset, State } from "./types";

export const defaults: State = {
  pos: { x: 0, y: 0, z: 0 },
  rot: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  cam: { x: 4, y: 3, z: 5 },
  fov: 75,
  lookAt: { x: 0, y: 0, z: 0 },
};

export const state: State = structuredClone(defaults);

export const get = (p: string): number =>
  p.split(".").reduce<any>((o, k) => o[k], state);

export const set = (p: string, v: number) => {
  const parts = p.split(".");
  const last = parts.pop()!;
  parts.reduce<any>((o, k) => o[k], state)[last] = v;
};

const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} not found`);
  return el as T;
};

const valueEls: Record<string, HTMLElement> = {};
const inputEls: Record<string, HTMLInputElement> = {};

function makeSlider(
  parent: HTMLElement,
  path: string,
  min: number,
  max: number,
  step: number,
  axis?: Axis,
) {
  const div = document.createElement("div");
  div.className = "ctrl";
  div.dataset.path = path;
  const name = path.split(".").pop()!;
  const cls = axis ? `axis-${axis}` : "";
  div.innerHTML = `
    <span class="name ${cls}">${name}</span>
    <input type="range" min="${min}" max="${max}" step="${step}" value="${get(path)}">
    <span class="val">${get(path).toFixed(2)}</span>
  `;
  parent.appendChild(div);
  const input = div.querySelector("input")!;
  const val = div.querySelector(".val") as HTMLElement;
  input.addEventListener("input", () => {
    const v = parseFloat(input.value);
    set(path, v);
    val.textContent = v.toFixed(2);
  });
  valueEls[path] = val;
  inputEls[path] = input;
}

const triple = (
  parent: HTMLElement,
  group: string,
  range: number,
  step: number,
) => {
  makeSlider(parent, `${group}.x`, -range, range, step, "x");
  makeSlider(parent, `${group}.y`, -range, range, step, "y");
  makeSlider(parent, `${group}.z`, -range, range, step, "z");
};

export function applyState(next: State) {
  Object.assign(state, structuredClone(next));
  for (const path of Object.keys(inputEls)) {
    const v = get(path);
    inputEls[path]!.value = String(v);
    valueEls[path]!.textContent = v.toFixed(2);
  }
}

const presets: Preset[] = [
  { name: "Default", state: defaults },
  {
    name: "Telephoto 15°",
    state: { ...defaults, fov: 15, cam: { x: 8, y: 4, z: 10 } },
  },
  {
    name: "Fisheye 110°",
    state: { ...defaults, fov: 110, cam: { x: 2, y: 2, z: 3 } },
  },
  { name: "Top-down", state: { ...defaults, cam: { x: 0, y: 6, z: 0.01 } } },
  { name: "From below", state: { ...defaults, cam: { x: 0, y: -4, z: 4 } } },
  { name: "Squashed", state: { ...defaults, scale: { x: 2, y: 0.3, z: 2 } } },
];

export function initControls() {
  triple($("ctrls-pos"), "pos", 3, 0.1);
  triple($("ctrls-rot"), "rot", Math.PI, 0.01);
  makeSlider($("ctrls-scale"), "scale.x", 0.1, 3, 0.05, "x");
  makeSlider($("ctrls-scale"), "scale.y", 0.1, 3, 0.05, "y");
  makeSlider($("ctrls-scale"), "scale.z", 0.1, 3, 0.05, "z");
  triple($("ctrls-cam"), "cam", 10, 0.1);
  makeSlider($("ctrls-fov"), "fov", 10, 120, 1);
  triple($("ctrls-lookat"), "lookAt", 3, 0.1);

  const presetEl = $("presets");
  for (const p of presets) {
    const b = document.createElement("button");
    b.textContent = p.name;
    b.onclick = () => applyState(structuredClone(p.state));
    presetEl.appendChild(b);
  }

  $<HTMLButtonElement>("reset-btn").onclick = () => applyState(defaults);
}
