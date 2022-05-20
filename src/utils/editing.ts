import { DrawLineStringMode, DrawPolygonMode, EditingMode } from "react-map-gl-draw";

export const MODES = [
    { id: "drawPolyline", text: "Draw Polyline", handler: DrawLineStringMode },
    { id: "drawPolygon", text: "Draw Polygon", handler: DrawPolygonMode },
    { id: "editing", text: "Edit Feature", handler: EditingMode },
    ];