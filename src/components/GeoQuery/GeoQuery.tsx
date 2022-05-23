import React, { useState } from 'react'
import { EditorState } from '../../types'
import { MODES_MAP } from '../../utils/editing'

import Map from '../Map'

const GeoQuery = () => {
    const [editorState, setEditorState] = useState<EditorState>({
        mode: MODES_MAP['view'],
        features: [],
        selectedFeatureIndex: null
    })

    return (
        <Map
            seed="random"
            editor={ editorState }
            onEditorUpdated={ editor => setEditorState(editor) }/>
    )
}

export default GeoQuery