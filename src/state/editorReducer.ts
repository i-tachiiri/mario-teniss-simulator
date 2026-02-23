export interface EditorState {
  shotSheetOpen: boolean;
  charSheetRole: 'self' | 'opponent' | null;
  draggingStarId: string | null;
  reorderMode: boolean;
}

export type EditorAction =
  | { type: 'openShotSheet' }
  | { type: 'closeShotSheet' }
  | { type: 'openCharSheet'; role: 'self' | 'opponent' }
  | { type: 'closeCharSheet' }
  | { type: 'setDraggingStar'; starId: string | null }
  | { type: 'setReorderMode'; enabled: boolean };

export const initialEditorState: EditorState = {
  shotSheetOpen: false,
  charSheetRole: null,
  draggingStarId: null,
  reorderMode: false,
};

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'openShotSheet': return { ...state, shotSheetOpen: true };
    case 'closeShotSheet': return { ...state, shotSheetOpen: false };
    case 'openCharSheet': return { ...state, charSheetRole: action.role };
    case 'closeCharSheet': return { ...state, charSheetRole: null };
    case 'setDraggingStar': return { ...state, draggingStarId: action.starId };
    case 'setReorderMode': return { ...state, reorderMode: action.enabled };
    default: return state;
  }
}
