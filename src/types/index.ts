
export interface EditorMode {
    id: string
    text: string
    handler: any
}

export interface EditorState {
    mode?: EditorMode
    features: any[]
    selectedFeatureIndex: number
}