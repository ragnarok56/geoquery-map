import React from 'react'
import BasemapLayers from '../Map/BaseMaps'
import { BasemapLayer } from '../../types'
import Panel from '../Controls/Panel'

interface BaseMapsProps {
    selectedBaseMapId: string
    onSetBaseMap: (basemap: BasemapLayer) => void
}

const BaseMaps = ({ onSetBaseMap, selectedBaseMapId }: BaseMapsProps) => {
    return (   
        <Panel>
            <h4 style={ { margin: 0 } }>BaseMap</h4>
            <ul style={ { listStyle: 'none', textAlign: 'left', padding: 0, margin: 0, marginBottom: '10px' } }>
                { BasemapLayers.map((basemap) => (
                    <li key={ basemap.id } value={ basemap.id } 
                        style={ { background: selectedBaseMapId === basemap.id ? '#111' : '#333', cursor: 'pointer', padding: 3 } }
                        onClick={ () => onSetBaseMap(basemap) }>
                        { basemap.name }
                    </li>
                )) }
            </ul>
        </Panel>  
    )
}

export default BaseMaps