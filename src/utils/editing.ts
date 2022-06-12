import { DrawPolygonMode, DrawRectangleMode, ViewMode } from "nebula.gl";
import { EditingMode } from "react-map-gl-draw";

import { EditorMode } from '../types'

// class LogMode extends GeoJsonEditMode {

//     handleClick(event, props) {
//         console.log(event)
//     }
  
//     // No special handling for dragging
//     handlePointerMove(event) {}
//     handleStartDragging(event) {}
//     handleStopDragging(event) {}
// }

// class TooltipViewMode extends ViewMode {
//     getTooltips(props: ModeProps<FeatureCollection>): Tooltip[] {
    
//         return props.data?.features?.map(x => {
//             const centroid = turfCentroid(x.geometry)

//             return {
//                 position: centroid.geometry.coordinates,
//                 text: x.properties?.name
//             } as Tooltip
//         })
//       }
// }

export const MODES: EditorMode[] = [
    { id: 'view', text: 'View', handler: ViewMode },
    { id: "drawPolygon", text: "Draw Polygon", handler: DrawPolygonMode },
    { id: "drawRectangle", text: "Draw Rectangle", handler: DrawRectangleMode },
    { id: "editing", text: "Edit Feature", handler: EditingMode }
]

export const MODES_MAP: Record<string, EditorMode> = Object.fromEntries(MODES.map(x => [x.id, x]))

export const getEditMode = (id: string) => {
    if (!id) {
        return
    }

    return MODES_MAP[id]    
}