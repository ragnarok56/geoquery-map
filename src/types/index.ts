
export interface EditorMode {
    id: string
    text: string
    handler: any
}

export interface EditorState {
    mode?: EditorMode
}

export interface NAIFeatureProperties {
    name: string
}

export type NAIFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon, NAIFeatureProperties>

export interface NAIEditing {
    name?: string
    featureCollection: NAIFeatureCollection
    selectedFeatureIndexes: number[]
}