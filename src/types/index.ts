
export interface EditorMode {
    id: string
    text: string
    handler: any
}

export interface EditorState {
    mode?: EditorMode
}

export interface GeoJsonFeatures {
    features: any[]
    selectedFeatureIndex: number
}