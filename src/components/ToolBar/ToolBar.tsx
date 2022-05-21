import React from 'react'
import { EditorState } from '../../types'
import { MODES } from '../../utils/editing'

interface ToolbarProps {
    editor: EditorState
    onRefresh: () => void
    onSetMode: (id: string) => void
}

const Toolbar = ({ editor, onRefresh, onSetMode }: ToolbarProps) => {
    return (
        <div style={{ position: 'absolute', padding: '10px', margin: '50px', top: 0, left: 0, background: "#888" }}>
            <div style={{ cursor: 'pointer', padding: '10px', marginBottom: '10px', background: "#333" }}
                onClick={onRefresh}>
                <span>"Refresh"</span>
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