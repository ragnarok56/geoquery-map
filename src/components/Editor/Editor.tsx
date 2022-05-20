import React from 'react'
import { 
    Editor as Draw
} from 'react-map-gl-draw'

import { MODES } from '../../utils/editing'

import { EditorState } from '../../types'

interface EditorProps {
    editor: EditorState
}

const Editor = ({ editor }: EditorProps) => {
    
    return (
        <Draw
            clickRadius={12}
            features={ editor.features }
            mode={ MODES.find(x => x.id === editor.mode) }
            onSelect={ () => console.log('onSelect') }
            onUpdate={ () => console.log('onUpdate') }
        />
    )
}

export default Editor