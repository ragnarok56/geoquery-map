import React, { useState } from 'react'

import Map from '../Map'

const GeoQuery = () => {
    const [editorState, setEditorState] = useState({
        mode: null,
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