export const MAP_WIDTH = 1024;
export const MAP_HEIGHT = 640;

export type MapCamera = { x: number; y: number; scale: 1 | 2 | 3 };
export type MapState = {
  hoveredRegion: string | null;
  selectedRegion: string | null;
  camera: MapCamera;
};

export type MapAction =
  | { type: 'hover'; regionId: string }
  | { type: 'unhover'; regionId?: string }
  | { type: 'select'; regionId: string }
  | { type: 'deselect' }
  | { type: 'panBy'; dx: number; dy: number }
  | { type: 'zoomTo'; scale: number }
  | { type: 'reset' };

export const initialMapState: MapState = {
  hoveredRegion: null,
  selectedRegion: null,
  camera: { x: 0, y: 0, scale: 1 }
};

function snapScale(scale: number): 1 | 2 | 3 {
  return Math.max(1, Math.min(3, Math.round(scale))) as 1 | 2 | 3;
}

function clampCamera(camera: MapCamera): MapCamera {
  return {
    ...camera,
    x: Math.min(0, Math.max(MAP_WIDTH - MAP_WIDTH * camera.scale, camera.x)),
    y: Math.min(0, Math.max(MAP_HEIGHT - MAP_HEIGHT * camera.scale, camera.y))
  };
}

export function mapReducer(state: MapState, action: MapAction): MapState {
  switch (action.type) {
    case 'hover': return { ...state, hoveredRegion: action.regionId };
    case 'unhover':
      return action.regionId && state.hoveredRegion !== action.regionId
        ? state
        : { ...state, hoveredRegion: null };
    case 'select': return { ...state, selectedRegion: action.regionId };
    case 'deselect': return { ...state, selectedRegion: null };
    case 'panBy':
      return { ...state, camera: clampCamera({ ...state.camera, x: state.camera.x + action.dx, y: state.camera.y + action.dy }) };
    case 'zoomTo': {
      const scale = snapScale(action.scale);
      const ratio = scale / state.camera.scale;
      return { ...state, camera: clampCamera({ scale, x: state.camera.x * ratio, y: state.camera.y * ratio }) };
    }
    case 'reset': return initialMapState;
  }
}
