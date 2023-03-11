import React, { useState } from 'react'
import { EditorState } from '../../types'
import { MODES_MAP } from '../../utils/editing'
import BasemapLayers from '../Map/BaseMaps'

import Map from '../Map'

const GeoQuery = () => {
    // in leui of redux, this is the "global" state
    const [editorState, setEditorState] = useState<EditorState>({
        mode: MODES_MAP['view'],
        basemap: BasemapLayers[0]
    })
    

    return (
        <Map
            seed="random"
            editor={ editorState }
            onEditorUpdated={ editor => setEditorState(editor) }/>
    )
}

export default GeoQuery