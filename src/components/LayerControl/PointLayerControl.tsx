import React from 'react'

import SliderInput from '../SliderInput'

interface PointLayerControlProps {
    layerConfig: any
    onLayerConfigUpdated: (layerConfig: any) => void
}

const PointLayerControl = ({ 
    layerConfig,
    onLayerConfigUpdated
}: PointLayerControlProps) => {
    return (
        <div style={{ position: 'absolute', bottom: 0, left: 0, padding: 5, margin: 10, background: '#888', display: 'flex', flexDirection: 'column' }}>
            <h4 style={ { margin: 0 } }>Point Layer Options</h4>
            <SliderInput
                label="Opacity"
                value={ layerConfig.opacity }
                max={ 1 }
                step={ 0.05 }
                onChange={ x => onLayerConfigUpdated({ ...layerConfig, opacity: x }) }/>
            <SliderInput
                label="Elevation Scale"
                disabled={ !layerConfig.extruded }
                max={ 1000 }
                value={ layerConfig.elevationScale }
                onChange={ x => onLayerConfigUpdated({ ...layerConfig, elevationScale: x }) }/>
            <label>
                Extruded
                <input type="checkbox"
                    value={ layerConfig.extruded }
                    onChange={ () => onLayerConfigUpdated({ ...layerConfig, extruded: !layerConfig.extruded })}/>
            </label>
        </div>
    )
}

export default PointLayerControl