import { useRef } from 'react';
import type { Scene } from '../../../domain/types/scene';
import { AddSceneButton } from './AddSceneButton';
import { SceneChip } from './SceneChip';

export function SceneStrip({ scenes, selectedSceneId, reorderMode, onSelect, onAdd, onMove, onEnableReorder }: {
  scenes: Scene[];
  selectedSceneId: string;
  reorderMode: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onMove: (activeId: string, overId: string) => void;
  onEnableReorder: () => void;
}) {
  const dragIdRef = useRef<string | null>(null);

  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      {scenes.map((scene, index) => (
        <SceneChip
          key={scene.id}
          label={`Scene ${index + 1}`}
          active={scene.id === selectedSceneId}
          onClick={() => onSelect(scene.id)}
          onLongPressStart={() => {
            const timer = setTimeout(onEnableReorder, 500);
            const clear = () => clearTimeout(timer);
            window.addEventListener('pointerup', clear, { once: true });
          }}
          draggable={reorderMode}
          onDragStart={() => {
            dragIdRef.current = scene.id;
          }}
          onDrop={() => {
            if (dragIdRef.current) onMove(dragIdRef.current, scene.id);
          }}
          onDragOver={e => e.preventDefault()}
        />
      ))}
      <AddSceneButton onClick={onAdd} />
    </div>
  );
}
