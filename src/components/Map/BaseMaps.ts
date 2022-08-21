import { TileLayer, BitmapLayer } from "deck.gl";
import { load } from '@loaders.gl/core'
import {Matrix4} from '@math.gl/core';


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
        bounds: [west, south, east, north]
      });
    }
  })

console.log(new Matrix4().rotateX((-45 / 180) * Math.PI))

const mainBasemapWGS84 = new TileLayer({
    id: 'basemap-mainmap',
    getTileData: (tile) => {
        const urlQueryStringParams = {
            SERVICE: 'WMS',
            VERSION: '1.3.0',
            REQUEST: 'GetMap',
            LAYERS: 'ne:NE1_HR_LC_SR_W_DR',
            TILED: 'true',
            bbox: [tile.bbox.bottom, tile.bbox.left, tile.bbox.top, tile.bbox.right].join(','),
            format: 'image/png',
            height: 256,
            width: 256,
            crs: 'EPSG:4326'
        }
        console.log(tile, urlQueryStringParams)
        const urlQueryString = Object.keys(urlQueryStringParams).map(key => key + '=' + urlQueryStringParams[key]).join('&');
        const url = 'https://ahocevar.com/geoserver/wms'
        // return load(`${url}?${urlQueryString}`)
        throw 'fail'
    },
    minZoom: 0,
    maxZoom: 19,
    tileSize: 180,
    // modelMatrix: [
    //     1,0,0,0,
    //     0,-1,0,0,
    //     0,0,1,0,
    //     -180,90,0,1
    // ],
    modelMatrix: new Matrix4().rotateX((-45 / 180) * Math.PI),
    extent: [-180,-90,180,90],
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
