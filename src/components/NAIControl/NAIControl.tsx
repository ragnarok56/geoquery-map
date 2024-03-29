import React from 'react'
import { NAIEditing } from '../../types'

interface NAIControlProps {
    editingFeatures: NAIEditing
    onToggleSelectFeature: (i: number) => void
    onDeleteFeature: (i: number) => void
    onEditFeatureName: (i: number, name: string) => void
    onEditFeatureCollectionName: (name: string) => void
    onFlyToFeature: (i?: number) => void
}

const NAIControl = ({ 
    editingFeatures,
    onToggleSelectFeature,
    onDeleteFeature,
    onEditFeatureName,
    onEditFeatureCollectionName,
    onFlyToFeature
}: NAIControlProps) => {
    return (
        <div style={{ fontFamily: 'monospace' }}>
            <input type="text" value={ editingFeatures.name || "New NAI" }
                onChange={ (e) => onEditFeatureCollectionName(e.target.value) }/>
            <span onClick={() => onFlyToFeature()}
                            title="fly to"
                            style={{ cursor: 'pointer' }}>O</span>
            <ul style={{ listStyle: 'none', margin: 0, padding: '10px' }}>
                {editingFeatures.featureCollection.features.map((x, i) => {
                    return (
                        <li key={i}>
                            <input type="checkbox" checked={ editingFeatures.selectedFeatureIndexes.includes(i)}
                                onChange={ () => onToggleSelectFeature(i) }/>
                            <input style={{ marginRight: '10px' }}
                                type="text" value={x.properties?.name}
                                onChange={ e => onEditFeatureName(i, e.target.value) }/>
                            <span onClick={() => onDeleteFeature(i)}
                                title="delete"
                                style={{ cursor: 'pointer' }}>X</span>
                            <span onClick={() => onFlyToFeature(i)}
                                title="fly to"
                                style={{ cursor: 'pointer' }}>O</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default NAIControl