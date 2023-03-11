import React from 'react'
import * as d3 from 'd3';

import SliderInput from '../SliderInput'

interface GeohashLayerControlProps {
    layerConfig: any
    onLayerConfigUpdated: (layerConfig: any) => void
}

function hex2rgb(hex: string) {
    const value = parseInt(hex, 16);
    return [16, 8, 0].map((shift) => ((value >> shift) & 0xff));
}

const convertInterpolateToArray = (x: string): [number, number, number] => {
    let r
    if (x.startsWith('#')) {
        r = hex2rgb(x.substring(1).toUpperCase())
    } else {
        r = x.split('(')[1].split(')')[0].split(',').map(n => Number(n))
    }
    return [r[0], r[1], r[2]]
}

export const colorDomains = [
    {
        name: 'RdYlGn',
        getFillColor: d => convertInterpolateToArray(d3.interpolateRdYlGn(d.value))
    },
    {
        name: 'Viridis',
        getFillColor: d => convertInterpolateToArray(d3.interpolateViridis(d.value))
    }
]

const GeohashLayerControl = ({ 
    layerConfig,
    onLayerConfigUpdated
}: GeohashLayerControlProps) => {
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
            <div><b>Colors</b></div>
            <ul style={ { listStyle: 'none', textAlign: 'left', padding: 0, margin: 0, marginBottom: '10px' } }>
                { colorDomains.map((color) => (
                    <li key={ color.name } value={ color.name } 
                        style={ { background: layerConfig.color.name === color.name ? '#111' : '#333', cursor: 'pointer', padding: 3 } }
                        onClick={ () => onLayerConfigUpdated({ ...layerConfig, color: color }) }>
                        { color.name }
                    </li>
                )) }
            </ul>
        </div>
    )
}

export default GeohashLayerControl