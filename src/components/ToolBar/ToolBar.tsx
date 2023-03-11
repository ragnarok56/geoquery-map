import React from 'react'
import { BasemapLayer, EditorState } from '../../types'
import { MODES } from '../../utils/editing'
import BasemapLayers from '../Map/BaseMaps'

interface ToolbarProps {
    editor: EditorState
    perspectiveEnabled: boolean
    featureNamesVisible: boolean
    onSetBaseMap: (basemap: BasemapLayer) => void
    onRefresh: () => void
    onSetMode: (id: string) => void
    onTogglePerspective: () => void
    onToggleFeatureNamesVisible: () => void
}

const Toolbar = ({ 
    editor,
    perspectiveEnabled,
    featureNamesVisible,
    onRefresh,
    onSetBaseMap,
    onSetMode,
    onTogglePerspective,
    onToggleFeatureNamesVisible,
}: ToolbarProps) => {
    return (
        <div style={{ position: 'absolute', padding: '5px', margin: '10px', top: 0, left: 0, background: "#888", width: '200px' }}>
            <div style={{ cursor: 'pointer', padding: '10px', marginBottom: '10px', background: "#333" }}
                onClick={onRefresh}>
                <span>"Refresh"</span>
            </div>
            <div style={{ cursor: 'pointer', padding: '10px', marginBottom: '10px', background: "#333", fontSize: 16 }}
                onClick={onTogglePerspective}>
                <span>{ perspectiveEnabled ? 'Exit the 3rd Dimension' : 'Enter the 3rd Dimension' }</span>
            </div>

            <h4 style={ { margin: 0 } }>Edit Mode</h4>
            <ul style={ { listStyle: 'none', textAlign: 'left', padding: 0, margin: 0, marginBottom: '10px' } }>
                { MODES.map((mode) => (
                    <li key={ mode.id } value={ mode.id } 
                        style={ { background: editor.mode?.id === mode.id ? '#111' : '#333', cursor: 'pointer', padding: 3 } }
                        onClick={ () => onSetMode(mode.id) }>
                        { mode.text }
                    </li>
                )) }
            </ul>
            
            <h4 style={ { margin: 0 } }>BaseMap</h4>
            <ul style={ { listStyle: 'none', textAlign: 'left', padding: 0, margin: 0, marginBottom: '10px' } }>
                { BasemapLayers.map((basemap) => (
                    <li key={ basemap.id } value={ basemap.id } 
                        style={ { background: editor.basemap.id === basemap.id ? '#111' : '#333', cursor: 'pointer', padding: 3 } }
                        onClick={ () => onSetBaseMap(basemap) }>
                        { basemap.name }
                    </li>
                )) }
            </ul>

            <div style={{ cursor: 'pointer', padding: '10px', marginBottom: '10px', background: "#333", fontSize: 16 }}
                onClick={onToggleFeatureNamesVisible}>
                <span>{ featureNamesVisible ? 'Hide Feature Names' : 'Show Feature Names' }</span>
            </div>
        </div>
    )
}

export default Toolbar