// export interface Feature {
//     id: string
//     properties: any
//     geometry: {
//       type: string
//       coordinates: any
//     }
// }

// import { Feature } from '@nebula.gl/edit-modes'

export interface EditorState {
    mode: string
    features: any[]
    selectedFeatureIndex: number
}