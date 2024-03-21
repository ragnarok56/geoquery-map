import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers/typed'
import { BasemapLayer } from "../../types";

const url = 'https://ows.mundialis.de/services/service'

const mainBasemapWMSLayer = new WMSLayer({
    id: 'basemap-wmslayer',
    data: url,
    serviceType: 'wms',
    layers: ['TOPO-OSM-WMS'],
    srs: 'EPSG:4326'
})

const basemapLayers: BasemapLayer[] = [
    {
        id: mainBasemapWMSLayer.id,
        name: 'WMSLayer (experimental)',
        layer: mainBasemapWMSLayer
    }
]

export default basemapLayers
