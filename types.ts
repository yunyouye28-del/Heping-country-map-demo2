export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface BuildingProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  width: number;
  depth: number;
  height: number;
  variant?: 'gable' | 'flat' | 'tower';
}

export interface TreeProps {
  position: [number, number, number];
  scale?: number;
}

export interface BridgeProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  length: number;
}
