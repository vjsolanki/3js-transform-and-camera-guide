export type Vec3 = { x: number; y: number; z: number };

export type State = {
  pos: Vec3;
  rot: Vec3;
  scale: Vec3;
  cam: Vec3;
  fov: number;
  lookAt: Vec3;
};

export type Axis = 'x' | 'y' | 'z';

export type Lesson = {
  title: string;
  do: string;
  watch: string;
  state: State;
  highlight: string[];
};

export type Preset = {
  name: string;
  state: State;
};
