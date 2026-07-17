'use client';

import { useEffect, useRef, useState, type Dispatch, type PointerEvent as ReactPointerEvent, type WheelEvent } from 'react';
import type { Region } from '@/content/schema';
import { MAP_HEIGHT, MAP_WIDTH, type MapAction, type MapState } from '@/lib/mapState';

const GRID = 16;
const INK = 0x3b3245;
const OUTLINE = 4;
const accents: Record<string, number> = {
  databases: 0xd98f6c, infra: 0x8f9fd9, 'ai-types': 0xc98fd9, git: 0xd96c6c,
  languages: 0x6cd9a8, security: 0xd9c96c, design: 0xed9ec4, 'pm-tools': 0x9ad0ed
};
const snap = (value: number) => Math.round(value / GRID) * GRID;
const seedFrom = (value: string) => [...value].reduce((seed, character) => Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261);
const hashCell = (seed: number, x: number, y: number) => {
  let value = seed ^ Math.imul(x + 101, 0x9e3779b1) ^ Math.imul(y + 211, 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
  value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
};
function islandMask(columns: number, rows: number, regionId: string) {
  const seed = seedFrom(regionId);
  const centerX = Math.floor(columns / 2);
  const centerY = Math.floor(rows / 2);
  const candidate = Array.from({ length: rows }, (_, y) => Array.from({ length: columns }, (_, x) => {
    let noise = 0;
    for (let ny = -1; ny <= 1; ny += 1) {
      for (let nx = -1; nx <= 1; nx += 1) noise += hashCell(seed, x + nx, y + ny);
    }
    const dx = (x - centerX) / Math.max(1, columns * 0.5);
    const dy = (y - centerY) / Math.max(1, rows * 0.5);
    const falloff = Math.sqrt(dx * dx + dy * dy);
    return noise / 9 + (1 - falloff) * 0.58 > 0.64;
  }));
  candidate[centerY][centerX] = true;

  const connected = Array.from({ length: rows }, () => Array(columns).fill(false) as boolean[]);
  const queue: Array<[number, number]> = [[centerX, centerY]];
  connected[centerY][centerX] = true;
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const [x, y] = queue[cursor];
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx >= 0 && nx < columns && ny >= 0 && ny < rows && candidate[ny][nx] && !connected[ny][nx]) {
        connected[ny][nx] = true;
        queue.push([nx, ny]);
      }
    }
  }
  return connected;
}

function mixColors(base: number, accent: number, amount: number) {
  const channel = (shift: number) => Math.round(((base >>> shift) & 0xff) * (1 - amount) + ((accent >>> shift) & 0xff) * amount);
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

function darken(color: number, amount: number) {
  const channel = (shift: number) => Math.round(((color >>> shift) & 0xff) * (1 - amount));
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

export function MapCanvas({ regions, state, dispatch, reducedMotion, onZoom, onSelect }: {
  regions: readonly Region[];
  state: MapState;
  dispatch: Dispatch<MapAction>;
  reducedMotion: boolean;
  onZoom: (scale: number) => void;
  onSelect: (title: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<import('pixi.js').Container | null>(null);
  const islandRefs = useRef(new Map<string, { container: import('pixi.js').Container; baseY: number }>());
  const dragRef = useRef<{ x: number; y: number } | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('nocanvas') === '1') {
      queueMicrotask(() => setFallback(true));
      return;
    }
    let disposed = false;
    let app: import('pixi.js').Application | undefined;
    const islands = islandRefs.current;
    void (async () => {
      try {
        const PIXI = await import('pixi.js');
        PIXI.TextureStyle.defaultOptions.scaleMode = 'nearest';
        let pixelFont = 'monospace';
        try {
          const resolvedFont = getComputedStyle(document.body).getPropertyValue('--font-pixel').trim();
          if (!resolvedFont) throw new Error('Pixel font family is unavailable');
          await document.fonts.ready;
          await document.fonts.load(`14px ${resolvedFont}`);
          if (!document.fonts.check(`14px ${resolvedFont}`)) throw new Error('Pixel font failed to load');
          pixelFont = resolvedFont;
        } catch {
          pixelFont = 'monospace';
        }
        app = new PIXI.Application();
        await app.init({ width: MAP_WIDTH, height: MAP_HEIGHT, background: '#7ec8c9', antialias: false, preference: 'webgl', roundPixels: true });
        if (disposed || !hostRef.current) { app.destroy(true); return; }
        app.canvas.className = 'map-canvas';
        app.canvas.setAttribute('aria-hidden', 'true');
        hostRef.current.appendChild(app.canvas);

        const world = new PIXI.Container();
        worldRef.current = world;
        app.stage.addChild(world);
        const sea = new PIXI.Graphics().rect(0, 0, MAP_WIDTH, MAP_HEIGHT).fill(0x7ec8c9);
        world.addChild(sea);
        const seaDither = new PIXI.Graphics();
        for (let y = 8; y < MAP_HEIGHT; y += 12) {
          const row = Math.floor(y / 12);
          for (let x = 8 + (row % 4) * 4; x < MAP_WIDTH; x += GRID * 2) {
            if (hashCell(seedFrom('code-tutor-sea'), Math.floor(x / 4), row) > 0.18) seaDither.rect(x, y, 2, 2).fill(0x5aa8ad);
          }
        }
        world.addChild(seaDither);

        regions.forEach((region, index) => {
          const x = snap(region.mapArea.x / 100 * MAP_WIDTH);
          const sourceY = snap(region.mapArea.y / 100 * MAP_HEIGHT);
          const width = Math.max(GRID * 5, snap(region.mapArea.width / 100 * MAP_WIDTH));
          const sourceHeight = snap(region.mapArea.height / 100 * MAP_HEIGHT);
          const height = Math.max(GRID * 6, sourceHeight);
          const y = Math.max(0, Math.min(MAP_HEIGHT - height, sourceY - Math.round((height - sourceHeight) / 2)));
          const island = new PIXI.Container({ x, y });
          island.eventMode = 'static';
          island.cursor = 'pointer';
          island.hitArea = new PIXI.Rectangle(0, 0, width, height);
          island.on('pointerover', () => dispatch({ type: 'hover', regionId: region.id }));
          island.on('pointerout', () => dispatch({ type: 'unhover', regionId: region.id }));
          island.on('pointertap', () => {
            dispatch({ type: 'select', regionId: region.id });
            onSelect(region.title);
          });

          const accent = accents[region.id] ?? Object.values(accents)[index];
          const columns = Math.max(5, Math.floor(width / GRID));
          const rows = Math.max(6, Math.floor(height / GRID));
          const mask = islandMask(columns, rows, region.id);
          const isLand = (cellX: number, cellY: number) => cellX >= 0 && cellX < columns && cellY >= 0 && cellY < rows && mask[cellY][cellX];
          const shadow = new PIXI.Graphics();
          const terrain = new PIXI.Graphics();
          const outlines = new PIXI.Graphics();
          const grass = mixColors(0xa8d17a, accent, 0.12);
          const darkGrass = darken(grass, 0.13);
          for (let cellY = 0; cellY < rows; cellY += 1) {
            for (let cellX = 0; cellX < columns; cellX += 1) {
              if (!isLand(cellX, cellY)) continue;
              const px = cellX * GRID;
              const py = cellY * GRID;
              const outer = !isLand(cellX - 1, cellY) || !isLand(cellX + 1, cellY) || !isLand(cellX, cellY - 1) || !isLand(cellX, cellY + 1);
              const fill = outer ? 0xe8d8a0 : hashCell(seedFrom(`${region.id}-grass`), cellX, cellY) > 0.84 ? darkGrass : grass;
              terrain.rect(px, py, GRID, GRID).fill(fill);
              if (!isLand(cellX + 1, cellY)) shadow.rect(px + GRID, py, GRID, GRID).fill(0x5aa8ad);
              if (!isLand(cellX, cellY + 1)) shadow.rect(px, py + GRID, GRID, GRID).fill(0x5aa8ad);
              if (!isLand(cellX, cellY - 1)) outlines.moveTo(px, py).lineTo(px + GRID, py);
              if (!isLand(cellX + 1, cellY)) outlines.moveTo(px + GRID, py).lineTo(px + GRID, py + GRID);
              if (!isLand(cellX, cellY + 1)) outlines.moveTo(px + GRID, py + GRID).lineTo(px, py + GRID);
              if (!isLand(cellX - 1, cellY)) outlines.moveTo(px, py + GRID).lineTo(px, py);
            }
          }
          outlines.stroke({ color: INK, width: OUTLINE });
          island.addChild(shadow, terrain, outlines);

          const structure = new PIXI.Graphics();
          const cx = snap(width / 2) - GRID;
          const structureY = Math.max(GRID * 3, snap(height * 0.48));
          structure.rect(cx, structureY, GRID * 2, GRID).fill(accent).stroke({ color: INK, width: OUTLINE });
          structure.rect(cx - GRID, structureY + GRID, GRID * 4, GRID).fill(accent).stroke({ color: INK, width: OUTLINE });
          const padY = structureY + (height >= GRID * 8 ? GRID * 3 : GRID * 2);
          if (height >= GRID * 8) structure.rect(cx, structureY + GRID * 2, GRID * 2, GRID).fill(accent).stroke({ color: INK, width: OUTLINE });
          structure.rect(cx - GRID, padY, GRID * 4, GRID).fill(0xe8d8a0).stroke({ color: INK, width: OUTLINE });
          island.addChild(structure);

          const label = new PIXI.Text({ text: region.title, style: { fill: INK, fontFamily: pixelFont, fontSize: 14, align: 'center' } });
          label.anchor.set(0.5);
          const bannerWidth = Math.ceil(label.width) + 24;
          const bannerHeight = GRID * 2;
          const bannerX = Math.round((width - bannerWidth) / 2);
          const bannerY = 0;
          const banner = new PIXI.Graphics();
          banner.rect(bannerX + 4, bannerY + 4, bannerWidth, bannerHeight).fill({ color: INK, alpha: 0.35 });
          banner.rect(bannerX, bannerY, bannerWidth, bannerHeight).fill(0xf4e9d0).stroke({ color: 0x8a6d4a, width: OUTLINE });
          island.addChild(banner);
          label.position.set(width / 2, bannerY + bannerHeight / 2);
          label.roundPixels = true;
          island.addChild(label);
          world.addChild(island);
          islands.set(region.id, { container: island, baseY: y });
        });
      } catch {
        if (!disposed) setFallback(true);
      }
    })();
    return () => {
      disposed = true;
      worldRef.current = null;
      islands.clear();
      app?.destroy(true, { children: true });
    };
  }, [dispatch, onSelect, regions]);

  useEffect(() => {
    const world = worldRef.current;
    if (world) {
      world.scale.set(state.camera.scale);
      world.position.set(state.camera.x, state.camera.y);
    }
    islandRefs.current.forEach(({ container: island, baseY }, id) => {
      const active = state.hoveredRegion === id || state.selectedRegion === id;
      island.y = baseY + (active && !reducedMotion ? -2 : 0);
      island.alpha = state.selectedRegion && state.selectedRegion !== id ? 0.72 : 1;
    });
  }, [state, reducedMotion]);

  const pointerDown = (event: ReactPointerEvent) => {
    dragRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const pointerMove = (event: ReactPointerEvent) => {
    if (!dragRef.current) return;
    dispatch({ type: 'panBy', dx: Math.round(event.clientX - dragRef.current.x), dy: Math.round(event.clientY - dragRef.current.y) });
    dragRef.current = { x: event.clientX, y: event.clientY };
  };
  const zoom = (event: WheelEvent) => {
    event.preventDefault();
    const scale = state.camera.scale + (event.deltaY < 0 ? 1 : -1);
    dispatch({ type: 'zoomTo', scale });
    onZoom(Math.max(1, Math.min(3, scale)));
  };

  return (
    <div
      className="map-renderer"
      data-ambient-animation={reducedMotion ? 'disabled' : 'enabled'}
      ref={hostRef}
      role="group"
      tabIndex={0}
      aria-label="Interactive learning map. Use arrow keys to pan and plus or minus to zoom."
      onWheel={zoom}
      onPointerDown={pointerDown}
      onPointerMove={pointerMove}
      onPointerUp={() => { dragRef.current = null; }}
      onKeyDown={(event) => {
        const pans: Record<string, [number, number]> = { ArrowLeft: [32, 0], ArrowRight: [-32, 0], ArrowUp: [0, 32], ArrowDown: [0, -32] };
        if (pans[event.key]) { event.preventDefault(); dispatch({ type: 'panBy', dx: pans[event.key][0], dy: pans[event.key][1] }); }
        if (event.key === '+' || event.key === '=') {
          const scale = Math.min(3, state.camera.scale + 1);
          dispatch({ type: 'zoomTo', scale });
          onZoom(scale);
        }
        if (event.key === '-' || event.key === '_') {
          const scale = Math.max(1, state.camera.scale - 1);
          dispatch({ type: 'zoomTo', scale });
          onZoom(scale);
        }
      }}
    >
      {fallback && <div className="map-fallback" data-testid="map-fallback" aria-hidden="true">{regions.map((region) => <div key={region.id} className="fallback-island" style={{ left: `${region.mapArea.x}%`, top: `${region.mapArea.y}%`, width: `${region.mapArea.width}%`, height: `${region.mapArea.height}%`, '--region-accent': `#${(accents[region.id] ?? 0xd98f6c).toString(16)}` } as React.CSSProperties}><span>{region.title}</span></div>)}</div>}
    </div>
  );
}
