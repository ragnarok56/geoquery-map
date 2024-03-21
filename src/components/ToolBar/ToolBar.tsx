import React from 'react'
import { EditorState } from '../../types'
import { MODES } from '../../utils/editing'
import { Button } from '@mui/material'

interface ToolbarProps {
    editor: EditorState
    perspectiveEnabled: boolean
    featureNamesVisible: boolean
    onRefresh: () => void
    onSetMode: (id: string) => void
    onTogglePerspective: () => void
    onToggleFeatureNamesVisible: () => void
}

const Toolbar = ({ 
    editor,
    featureNamesVisible,
    onRefresh,
    onSetMode,
    onToggleFeatureNamesVisible,
}: ToolbarProps) => {
    return (
        <div style={{ padding: '10px', width: '400px' }}>
            <div>
                <Button onClick={ onRefresh }>Refresh</Button>
            </div>
            <h4 style={ { margin: 0, color: 'black' } }>Edit Mode</h4>
            <ul style={ { listStyle: 'none', textAlign: 'left', padding: 0, margin: 0, marginBottom: '10px' } }>
                { MODES.map((mode) => (
                    <li key={ mode.id } value={ mode.id } 
                        style={ { background: editor.mode?.id === mode.id ? '#111' : '#333', cursor: 'pointer', padding: 3 } }
                        onClick={ () => onSetMode(mode.id) }>
                        { mode.text }
                    </li>
                )) }
            </ul>
            <div>
                <Button onClick={onToggleFeatureNamesVisible} variant='contained'>{ featureNamesVisible ? 'Hide Feature Names' : 'Show Feature Names' }</Button>
            </div>
        </div>
    )
}

export default Toolbar