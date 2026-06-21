'use client';

import { useMemo } from 'react';
import type { Texture } from 'three';

import type { ScenePalette } from '../../../lib/scene-palette';
import type { OpeningPanel } from '../../../lib/wall-geometry';

type Props = { panels: OpeningPanel[]; palette: ScenePalette; wood: Texture };

/** A door leaf (wood-grained slab + frame border + handle) filling its hole. */
function DoorPanel({
  panel,
  palette,
  wood,
}: {
  panel: OpeningPanel;
  palette: ScenePalette;
  wood: Texture;
}) {
  const [w, h, t] = panel.size;
  const tint = panel.external ? palette.doorExternal : palette.door;
  const grain = useMemo(() => {
    const g = wood.clone();
    g.repeat.set(1, Math.max(2, Math.round(h / 0.6)));
    g.needsUpdate = true;
    return g;
  }, [wood, h]);
  return (
    <group position={panel.position} rotation={[0, panel.rotationY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w + 0.1, h + 0.08, t * 0.6]} />
        <meshStandardMaterial color={palette.frame} roughness={0.6} metalness={0.03} />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial map={grain} color={tint} roughness={0.62} metalness={0.06} />
      </mesh>
      <mesh position={[w * 0.34, 0, t * 0.7]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color={palette.handrail} roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

/** A glazed window: a 4-bar frame around a bright, lightly emissive pane. */
function WindowPanel({ panel, palette }: { panel: OpeningPanel; palette: ScenePalette }) {
  const [w, h, t] = panel.size;
  const bar = 0.08;
  const depth = Math.max(t * 1.4, 0.12);
  const bars: { pos: [number, number, number]; size: [number, number, number] }[] = [
    { pos: [0, h / 2 - bar / 2, 0], size: [w, bar, depth] },
    { pos: [0, -h / 2 + bar / 2, 0], size: [w, bar, depth] },
    { pos: [-w / 2 + bar / 2, 0, 0], size: [bar, h, depth] },
    { pos: [w / 2 - bar / 2, 0, 0], size: [bar, h, depth] },
  ];
  return (
    <group position={panel.position} rotation={[0, panel.rotationY, 0]}>
      <mesh>
        <boxGeometry args={[w - bar, h - bar, Math.max(t * 0.4, 0.03)]} />
        <meshStandardMaterial
          color={palette.glass}
          emissive={palette.glass}
          emissiveIntensity={0.3}
          roughness={0.06}
          metalness={0.1}
          transparent
          opacity={0.55}
        />
      </mesh>
      {bars.map((b, i) => (
        <mesh key={`bar-${i}`} position={b.pos} castShadow>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color={palette.windowFrame} roughness={0.6} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}

/** Render every door/window panel for a room. */
export function OpeningPanels({ panels, palette, wood }: Props) {
  return (
    <group>
      {panels.map((panel, i) =>
        panel.isDoor ? (
          <DoorPanel key={`door-${i}`} panel={panel} palette={palette} wood={wood} />
        ) : (
          <WindowPanel key={`window-${i}`} panel={panel} palette={palette} />
        ),
      )}
    </group>
  );
}
