import React, { useState } from 'react'
import { MODES_MAP } from '../../utils/editing'

import Map from '../Map'

const GeoQuery = () => {
    const [editorState, setEditorState] = useState({
        mode: MODES_MAP['view'],
        features: [],
        selectedFeatureIndex: null
    })

    return (
        <Map
            editor={ editorState }
            onEditorUpdated={ editor => setEditorState(editor) }/>
    )
}

export default GeoQuery