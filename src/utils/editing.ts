import { DrawLineStringMode, DrawPolygonMode, DrawRectangleMode, GeoJsonEditMode, ViewMode } from "nebula.gl";
import { EditingMode } from "react-map-gl-draw";

import { EditorMode } from '../types'

class LogMode extends GeoJsonEditMode {

    handleClick(event, props) {
        console.log(event)
    }
  
    // No special handling for dragging
    handlePointerMove(event) {}
    handleStartDragging(event) {}
    handleStopDragging(event) {}
  }

export const MODES: EditorMode[] = [
    { id: 'view', text: 'View', handler: ViewMode },
    { id: "drawPolyline", text: "Draw Polyline", handler: DrawLineStringMode },
    { id: "drawPolygon", text: "Draw Polygon", handler: DrawPolygonMode },
    { id: "drawRectangle", text: "Draw Rectangle", handler: DrawRectangleMode },
    { id: "editing", text: "Edit Feature", handler: EditingMode },
    { id: "log", text: "Log Clicks", handler: LogMode }
]

export const MODES_MAP: Record<string, EditorMode> = Object.fromEntries(MODES.map(x => [x.id, x]))

export const getEditMode = (id: string) => {
    if (!id) {
        return
    }

    return MODES_MAP[id]    
}