import { COORDINATE_SYSTEM } from "@deck.gl/core/typed";
import { BitmapLayer } from "@deck.gl/layers/typed";
import { load } from '@loaders.gl/core'
import {_WMSLayer as WMSLayer, TileLayer} from '@deck.gl/geo-layers/typed'
import { BasemapLayer } from "../../types";

// const mainBasemapMercator = new TileLayer({
//     id: 'basemap-mainmap',
//     data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
//     minZoom: 0,
//     maxZoom: 19,
//     tileSize: 256,

//     renderSubLayers: props => {
//       const {
//         bbox: {west, south, east, north}
//       } = props.tile;

//       return new BitmapLayer(props, {
//         data: null,
//         image: props.data,
//         _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT,
//         bounds: [west, south, east, north]
//       });
//     }
//   })

// function tileToBoundingBox(tile: any, tileSize: number) {
//     const {x, y} = tile.index
//     const north = y * tileSize
//     const west = x * tileSize
//     const south = north + tileSize
//     const east = west + tileSize
//     // console.log(tile, tileSize, north, west, south, east)
    
//     return [south, west, north, east]
// }

const mainBasemapWMSLayer = new WMSLayer({
    id: 'basemap-wmslayer',
    data: 'https://ahocevar.com/geoserver/wms',
    // data: 'https://ows.terrestris.de/osm/service',
    serviceType: 'wms',
    layers: ['ne:NE1_HR_LC_SR_W_DR'],
    srs: 'EPSG:4326'
})

const mainBasemap = new TileLayer({
    id: 'basemap-tilelayer',
    getTileData: (tile) => {
        const tileSize = 512
        console.log(tile.bbox)
        // @ts-ignore
        const {east, north, south, west} = tile.bbox
        const urlQueryStringParams = {
            SERVICE: 'WMS',
            VERSION: '1.1.1',
            REQUEST: 'GetMap',
            LAYERS: 'ne:NE1_HR_LC_SR_W_DR',
            TILED: 'true',
            bbox: [west, south, east, north].join(','),
            format: 'image/png',
            height: tileSize,
            width: tileSize,
            srs: 'EPSG:4326'
        }
        const urlQueryString = Object.keys(urlQueryStringParams).map(key => key + '=' + urlQueryStringParams[key]).join('&');
        const url = 'https://ahocevar.com/geoserver/wms'
        return load(`${url}?${urlQueryString}`)
    },
    minZoom: 0,
    maxZoom: 19,
    tileSize: 512,

    renderSubLayers: props => {
      const {
        // @ts-ignore
        bbox: {west, south, east, north}
      } = props.tile;

      // @ts-ignore
      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        bounds: [west, south, east, north]
      });
    }
  })

// @ts-ignore
const mainBasemapWGS84 = new TileLayer({
    id: 'basemap-mainmap',
    // @ts-ignore
    // TilesetClass: WMSTileset2D,
    // TilesetClass: Tilese
    getTileData: (tile) => {
        const tileSize = 512
        // @ts-ignore
        const {east, north, south, west} = tile.bbox
        // const [south, west, north, east] = tileToBoundingBox(tile, tileSize)
        const urlQueryStringParams = {
            SERVICE: 'WMS',
            VERSION: '1.1.1',
            REQUEST: 'GetMap',
            LAYERS: 'ne:NE1_HR_LC_SR_W_DR',
            TILED: 'true',
            // bbox: [south, west, north, east].join(','),
            bbox: [west, south, east, north].join(','),
            format: 'image/png',
            height: tileSize,
            width: tileSize,
            srs: 'EPSG:4326'
        }
        const urlQueryString = Object.keys(urlQueryStringParams).map(key => key + '=' + urlQueryStringParams[key]).join('&');
        const url = 'https://ahocevar.com/geoserver/wms'
        return load(`${url}?${urlQueryString}`)
    },
    minZoom: 0,
    maxZoom: 19,
    tileSize: 512,

    renderSubLayers: props => {
      const {
        // @ts-ignore
        bbox: {west, south, east, north}
      } = props.tile;

      // @ts-ignore
      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        bounds: [west, south, east, north]
      });
    }
  })

const miniBasemap = new TileLayer({
    id: 'basemap-minimap',
    data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',

    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,

    renderSubLayers: props => {
      const {
        // @ts-ignore
        bbox: {west, south, east, north}
      } = props.tile;

      // @ts-ignore
      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  })

const basemapLayers: BasemapLayer[] = [
    { 
        id: mainBasemap.id,
        name: 'TileLayer',
        layer: mainBasemap
    },
    {
        id: mainBasemapWMSLayer.id,
        name: 'WMSLayer (experimental)',
        layer: mainBasemapWMSLayer
    }
]

export default basemapLayers
