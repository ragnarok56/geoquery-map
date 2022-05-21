import { DrawLineStringMode, DrawPolygonMode, ViewMode } from "@nebula.gl/edit-modes";
import { EditingMode } from "react-map-gl-draw";
// import { DrawLineStringMode, DrawPolygonMode, EditingMode } from "react-map-gl-draw";

import { EditorMode } from '../types'

export const MODES: EditorMode[] = [
    { id: 'view', text: 'View', handler: ViewMode },
    { id: "drawPolyline", text: "Draw Polyline", handler: DrawLineStringMode },
    { id: "drawPolygon", text: "Draw Polygon", handler: DrawPolygonMode },
    { id: "editing", text: "Edit Feature", handler: EditingMode },
]

export const MODES_MAP: Record<string, EditorMode> = Object.fromEntries(MODES.map(x => [x.id, x]))

export const getEditMode = (id: string) => {
    if (!id) {
        return
    }

    return MODES_MAP[id]    
}