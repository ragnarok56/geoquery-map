import React from 'react'

interface LayerControlProps {
    layerConfig: any
    onLayerConfigUpdated: (layerConfig: any) => void
}

interface SliderInputProps {
    label: string
    value: number
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    onChange: (value: number) => void
}

const SliderInput = ({ label, value, onChange, min = 0, max = 100, step = 1, disabled }: SliderInputProps) => {
    return (
        <>
            <label htmlFor={ label }>{ label }</label>
            <input
                id={ label }
                type="range" 
                min={ min }
                max={ max }
                value={ value } 
                disabled={ disabled }
                onChange={ (e) => onChange(Number(e.target.value)) }
                step={ step }/>
        </>
    )
}

// todo: figure out how to make this generic for other layer types
const LayerControl = ({ 
    layerConfig,
    onLayerConfigUpdated
}: LayerControlProps) => {
    return (
        <div style={{ position: 'absolute', bottom: 0, left: 0, padding: 5, margin: 10, background: '#888', display: 'flex', flexDirection: 'column' }}>
            <h4 style={ { margin: 0 } }>Geohash Layer Options</h4>
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

export default LayerControl