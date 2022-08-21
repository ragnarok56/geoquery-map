import { TileLayer, BitmapLayer, COORDINATE_SYSTEM } from "deck.gl";
import { load } from '@loaders.gl/core'


const mainBasemapMercator = new TileLayer({
    id: 'basemap-mainmap',
    data: 'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,

    renderSubLayers: props => {
      const {
        bbox: {west, south, east, north}
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT,
        bounds: [west, south, east, north]
      });
    }
  })

function tileToBoundingBox(tile: any, tileSize: number) {
    const {x, y} = tile.index
    const north = y * tileSize
    const west = x * tileSize
    const south = north + tileSize
    const east = west + tileSize
    console.log(tile, tileSize, north, west, south, east)
    
    return [south, west, north, east]
}

const mainBasemapWGS84 = new TileLayer({
    id: 'basemap-mainmap',
    getTileData: (tile) => {
        const tileSize = 256
        const {east, north, south, west} = tile.bbox
        // const [south, west, north, east] = tileToBoundingBox(tile, tileSize)
        const urlQueryStringParams = {
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetMap',
            LAYERS: 'ne:NE1_HR_LC_SR_W_DR',
            TILED: 'true',
            bbox: [south, west, north, east].join(','),
            format: 'image/png',
            height: tileSize,
            width: tileSize,
            crs: 'EPSG:4326'
        }
        const urlQueryString = Object.keys(urlQueryStringParams).map(key => key + '=' + urlQueryStringParams[key]).join('&');
        const url = 'https://ahocevar.com/geoserver/wms'
        return load(`${url}?${urlQueryString}`)
    },
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,

    renderSubLayers: props => {
      const {
        bbox: {west, south, east, north}
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
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
        bbox: {west, south, east, north}
      } = props.tile;

      return new BitmapLayer(props, {
        data: null,
        image: props.data,
        bounds: [west, south, east, north]
      });
    }
  })

const basemapLayers = [
    mainBasemapWGS84,
    miniBasemap
]

export default basemapLayers
