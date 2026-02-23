import { useMemo, useReducer } from 'react';
import { documentReducer, initialDocumentState } from './documentReducer';
import { editorReducer, initialEditorState } from './editorReducer';

export function useStore() {
  const [document, docDispatch] = useReducer(documentReducer, initialDocumentState);
  const [editor, editorDispatch] = useReducer(editorReducer, initialEditorState);

  const selectedScene = useMemo(
    () => document.scenes.find(scene => scene.id === document.selectedSceneId) ?? document.scenes[0],
    [document],
  );

  return { document, selectedScene, editor, docDispatch, editorDispatch };
}
