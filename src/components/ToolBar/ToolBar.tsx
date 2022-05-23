import React from 'react'
import { EditorState } from '../../types'
import { MODES } from '../../utils/editing'

interface ToolbarProps {
    editor: EditorState
    perspectiveEnabled: boolean
    onRefresh: () => void
    onSetMode: (id: string) => void
    onTogglePerspective: () => void
}

const Toolbar = ({ editor, perspectiveEnabled, onRefresh, onSetMode, onTogglePerspective }: ToolbarProps) => {
    return (
        <div style={{ position: 'absolute', padding: '10px', margin: '50px', top: 0, left: 0, background: "#888", width: '200px' }}>
            <div style={{ cursor: 'pointer', padding: '10px', marginBottom: '10px', background: "#333" }}
                onClick={onRefresh}>
                <span>"Refresh"</span>
            </div>
            <div style={{ cursor: 'pointer', padding: '10px', marginBottom: '10px', background: "#333", fontSize: 16 }}
                onClick={onTogglePerspective}>
                <span>{ perspectiveEnabled ? 'Exit the 3rd Dimension' : 'Enter the 3rd Dimension' }</span>
            </div>

            <h4 style={ { marginBottom: '5px' } }>Edit Mode</h4>
            <ul style={ { listStyle: 'none', textAlign: 'left', padding: 0, margin: 0 } }>
                { MODES.map((mode) => (
                    <li key={ mode.id } value={ mode.id } 
                        style={ { background: editor.mode?.id === mode.id ? '#111' : '#333', cursor: 'pointer', padding: 3 } }
                        onClick={ () => onSetMode(mode.id) }>
                        { mode.text }
                    </li>
                )) }
            </ul>
        </div>
    )
}

export default Toolbar