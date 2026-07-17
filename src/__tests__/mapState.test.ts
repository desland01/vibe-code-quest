import { describe, expect, it } from 'vitest';
import { initialMapState, mapReducer } from '@/lib/mapState';

describe('mapReducer', () => {
  it('tracks hover and selection independently', () => {
    const hovered = mapReducer(initialMapState, { type: 'hover', regionId: 'git' });
    expect(mapReducer(hovered, { type: 'select', regionId: 'git' })).toMatchObject({ hoveredRegion: 'git', selectedRegion: 'git' });
    expect(mapReducer(hovered, { type: 'unhover', regionId: 'git' }).hoveredRegion).toBeNull();
  });

  it('clamps pan to map bounds', () => {
    const zoomed = mapReducer(initialMapState, { type: 'zoomTo', scale: 2 });
    expect(mapReducer(zoomed, { type: 'panBy', dx: 50, dy: 50 }).camera).toEqual({ x: 0, y: 0, scale: 2 });
    expect(mapReducer(zoomed, { type: 'panBy', dx: -9999, dy: -9999 }).camera).toEqual({ x: -1024, y: -640, scale: 2 });
  });

  it('snaps zoom to 1x, 2x, or 3x', () => {
    expect(mapReducer(initialMapState, { type: 'zoomTo', scale: 1.6 }).camera.scale).toBe(2);
    expect(mapReducer(initialMapState, { type: 'zoomTo', scale: 99 }).camera.scale).toBe(3);
    expect(mapReducer(initialMapState, { type: 'zoomTo', scale: -1 }).camera.scale).toBe(1);
  });

  it('resets all interaction state', () => {
    const state = { hoveredRegion: 'git', selectedRegion: 'git', camera: { x: -10, y: -10, scale: 2 as const } };
    expect(mapReducer(state, { type: 'reset' })).toEqual(initialMapState);
  });
});
