import { useMemo, useRef } from 'react';
import { createCourtMapper } from '../../../geometry/coord/courtToPixel';
import { sceneToRenderModel } from '../../../rendering/adapters/sceneToRenderModel';
import { useStore } from '../../../state/useStore';
import { Court } from '../Court/Court';
import { OverlayLayer } from '../Overlay/OverlayLayer';
import { EditToolbar } from '../Panels/EditToolbar';
import { SceneStrip } from '../SceneStrip/SceneStrip';
import { CharPickerSheet } from '../Sheets/CharPickerSheet';
import { ShotTypeSheet } from '../Sheets/ShotTypeSheet';

export function AppShell() {
  const { document, selectedScene, editor, docDispatch, editorDispatch } = useStore();
  const courtRef = useRef<HTMLDivElement | null>(null);

  const mapper = useMemo(() => {
    const rect = courtRef.current?.getBoundingClientRect();
    return createCourtMapper({ left: 0, top: 0, width: rect?.width ?? 300, height: rect?.height ?? 500 });
  }, [selectedScene.id]);

  const model = useMemo(() => sceneToRenderModel(selectedScene, mapper), [selectedScene, mapper]);

  const attachMove = (handler: (u: number, v: number) => void) => {
    const move = (event: PointerEvent) => {
      const rect = courtRef.current?.getBoundingClientRect();
      if (!rect) return;
      handler((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', () => window.removeEventListener('pointermove', move), { once: true });
  };

  const downloadScene = () => {
    const canvas = documentRefCanvas(selectedScene, 900, 1500);
    const url = canvas.toDataURL('image/png');
    const link = window.document.createElement('a');
    link.href = url;
    link.download = 'scene.png';
    link.click();
  };

  return (
    <div className="bg-slate-800 min-h-screen text-white">
      <div className="max-w-md mx-auto px-2 py-3 space-y-3">
        <h1 className="text-center font-black text-xl text-blue-300">MT-FEVER</h1>
        <SceneStrip
          scenes={document.scenes}
          selectedSceneId={document.selectedSceneId}
          reorderMode={editor.reorderMode}
          onSelect={sceneId => docDispatch({ type: 'selectScene', sceneId })}
          onAdd={() => docDispatch({ type: 'addScene', sourceSceneId: document.selectedSceneId })}
          onMove={(activeId, overId) => docDispatch({ type: 'reorderScenes', activeId, overId })}
          onEnableReorder={() => editorDispatch({ type: 'setReorderMode', enabled: true })}
        />
        <Court
          exportRef={courtRef}
          onPointerDown={event => {
            const rect = courtRef.current?.getBoundingClientRect();
            if (!rect) return;
            docDispatch({
              type: 'setBounce1',
              sceneId: selectedScene.id,
              pos: { u: (event.clientX - rect.left) / rect.width, v: (event.clientY - rect.top) / rect.height },
            });
          }}
        >
          <OverlayLayer
            model={model}
            onPlayerDown={(role, event) => {
              event.stopPropagation();
              attachMove((u, v) => docDispatch({ type: 'movePlayer', sceneId: selectedScene.id, role, pos: { u, v } }));
            }}
            onStarDown={(starId, event) => {
              event.stopPropagation();
              attachMove((u, v) => docDispatch({ type: 'moveStar', sceneId: selectedScene.id, starId, pos: { u, v } }));
            }}
          />
        </Court>
        <EditToolbar
          bendLevel={selectedScene.shot?.bendLevel ?? 0}
          onBend={v => docDispatch({ type: 'setBendLevel', sceneId: selectedScene.id, bendLevel: v })}
          onSelf={() => editorDispatch({ type: 'openCharSheet', role: 'self' })}
          onOpponent={() => editorDispatch({ type: 'openCharSheet', role: 'opponent' })}
          onShot={() => editorDispatch({ type: 'openShotSheet' })}
          onAddStar={() => docDispatch({ type: 'addStar', sceneId: selectedScene.id })}
          onDownload={downloadScene}
          onDelete={() => docDispatch({ type: 'deleteScene', sceneId: selectedScene.id })}
          subtitle={selectedScene.subtitle?.text ?? ''}
          onSubtitle={text => docDispatch({ type: 'setSubtitleText', sceneId: selectedScene.id, text })}
        />
      </div>
      <CharPickerSheet
        open={editor.charSheetRole !== null}
        title={editor.charSheetRole === 'self' ? '自分のキャラ' : '相手のキャラ'}
        onClose={() => editorDispatch({ type: 'closeCharSheet' })}
        onSelect={charId => {
          if (!editor.charSheetRole) return;
          docDispatch({ type: 'setChar', sceneId: selectedScene.id, role: editor.charSheetRole, charId });
          editorDispatch({ type: 'closeCharSheet' });
        }}
      />
      <ShotTypeSheet
        open={editor.shotSheetOpen}
        selected={selectedScene.shot?.typeId ?? 'flat'}
        onClose={() => editorDispatch({ type: 'closeShotSheet' })}
        onSelect={shotTypeId => {
          docDispatch({ type: 'setShotType', sceneId: selectedScene.id, shotTypeId });
          editorDispatch({ type: 'closeShotSheet' });
        }}
      />
    </div>
  );
}

function documentRefCanvas(scene: ReturnType<typeof useStore>['selectedScene'], width: number, height: number): HTMLCanvasElement {
  const canvas = window.document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#2563eb';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  for (let c = 1; c < 6; c += 1) {
    ctx.beginPath();
    ctx.moveTo((width / 6) * c, 0);
    ctx.lineTo((width / 6) * c, height);
    ctx.stroke();
  }
  for (let r = 1; r < 10; r += 1) {
    ctx.beginPath();
    ctx.moveTo(0, (height / 10) * r);
    ctx.lineTo(width, (height / 10) * r);
    ctx.stroke();
  }

  if (scene.shot) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(scene.shot.hitFrom.u * width, scene.shot.hitFrom.v * height);
    ctx.lineTo(scene.shot.bounce1.u * width, scene.shot.bounce1.v * height);
    ctx.stroke();
  }

  if (scene.subtitle?.text) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(width * 0.2, height * 0.03, width * 0.6, 70);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(scene.subtitle.text, width / 2, height * 0.08);
  }

  return canvas;
}
