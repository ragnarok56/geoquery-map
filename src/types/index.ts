import { Layer } from "@deck.gl/core/typed"

export interface EditorMode {
    id: string
    text: string
    handler: any
}

export interface EditorState {
    mode?: EditorMode
    basemap: BasemapLayer
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

export interface BasemapLayer {
    id: string
    name: string
    layer: Layer
}