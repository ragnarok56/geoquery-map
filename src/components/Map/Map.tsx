import React, { useState, useCallback, useMemo } from 'react'

import { BitmapLayer, PolygonLayer } from '@deck.gl/layers'
import { TileLayer } from '@deck.gl/geo-layers'
import { MapView, WebMercatorViewport } from '@deck.gl/core'

import DeckGL from 'deck.gl'

import { generateGeohashes, valueGeneratorGenerator } from '../../data'

import GeohashLayer from '../GeohashLayer/GeohashLayer'

const INITIAL_VIEW_STATE = {
    latitude: 0,
    longitude: 0,
    zoom: 1,
    bearing: 0,
    pitch: 0
}

interface MapProps {
    seed?: string
}

function checkLat(value: number) {
  if (value >= -90 && value <= 90)
    return value
  else
    return value < -90 ? -90 : 90
}

function checkLon(value: number) {
  if (value >= -180 && value <= 180)
    return value
  else
    return value < -180 ? -180 : 180
}

function getCorner(viewport, coord) {
  const [lon, lat] = viewport.unproject(coord);
  return [checkLon(lon), checkLat(lat)]
}

function getViewBoundsClipped(viewState) {
  const viewport = new WebMercatorViewport(viewState);

  const cUL = getCorner(viewport, [0, 0])
  const cUR = getCorner(viewport, [viewport.width, 0])
  const cLR = getCorner(viewport, [viewport.width, viewport.height])
  const cLL = getCorner(viewport, [0, viewport.height])
  
  return [cUL, cUR, cLR, cLL, cUL]
}

const Map = ({ seed }: MapProps) => {
    const [viewStates, setViewStates] = useState({
        mainmap: INITIAL_VIEW_STATE,
        minimap: INITIAL_VIEW_STATE
      });
    const [geohashData, setGeohashData] = useState([])
    const valueGenerator = useMemo(() => valueGeneratorGenerator(seed), [seed])

    const [viewBoundsPolygon, setViewBoundsPolygon] = useState([[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]])

    const onSetViewBounds = useCallback(() => {
        const polygon = getViewBoundsClipped(viewStates.mainmap)
        setViewBoundsPolygon(polygon)

        console.log('zoom: ' + viewStates.mainmap.zoom)

        const geohashes = generateGeohashes(
          viewStates.mainmap.zoom,
          [
            Math.min(...polygon.map(([_, x]) => x)),
            Math.min(...polygon.map(([x, _]) => x)),
            Math.max(...polygon.map(([_, x]) => x)),
            Math.max(...polygon.map(([x, _]) => x))
          ]
        )
        
        setGeohashData(geohashes.map(x => ({ geohash: x, value: valueGenerator() })))
    }, [viewStates])
    
    const layers = [
          new TileLayer({
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
          }),
          new TileLayer({
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
          }),
          new GeohashLayer({
            id: 'geohash-layer',
            data: geohashData,
            pickable: true,
            wireframe: false,
            filled: true,
            extruded: true,
            opacity: 0.3,
            getGeohash: d => d.geohash,
            getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],
            getElevation: d => d.value * 100
        }),
        new PolygonLayer({
            id: 'polygon-layer',
            data: [{ polygon: viewBoundsPolygon }],
            pickable: true,
            stroked: true,
            filled: false,
            wireframe: true,
            lineWidthMinPixels: 10,
            getPolygon: d => d.polygon,
            getLineColor: [255, 0, 0],
            getLineWidth: 1
        })
    ]

    const layerFilter = useCallback(({layer, viewport}) => {
        if (viewport.id === 'minimap' && layer.id === 'basemap-minimap') {
          return true;
        } else {
            if (viewport.id === 'mainmap') {
                if (layer.id === 'basemap-minimap') {
                    return false
                }
                return true;
            }
        }
        return false;
      }, []);

    const views = [
        new MapView({
            id: 'mainmap'
        }),
        new MapView({
            id: 'minimap',
            x: '80%',
            y: '65%',
            height: '30%',
            width: '15%',
            clear: true,
            controller: true
          })
    ]

    const onViewStateChange = useCallback(({viewId, viewState}) => {      
        if (viewId === 'mainmap') {
          setViewStates(currentViewStates => ({
            mainmap: viewState,
            minimap: {
              ...currentViewStates.minimap,
              longitude: viewState.longitude,
              latitude: viewState.latitude
            }
          }));
        } else {
          setViewStates(currentViewStates => ({
            mainmap: {
              ...currentViewStates.mainmap,
              longitude: viewState.longitude,
              latitude: viewState.latitude
            },
            minimap: viewState
          }));
        }
      }, []);

    return (
        <>
            <DeckGL
                controller
                layerFilter={ layerFilter }
                layers={ layers }
                views={ views }
                viewState={viewStates}
                onViewStateChange={ onViewStateChange }
                />
            <div style={ { position: 'absolute', cursor: 'pointer', padding: '10px', margin: '50px', top: 0, left: 0, background: "#888" } }
                onClick={ onSetViewBounds }> 
                <span>Set Bounds</span>
            </div>
        </>
    )
}

export default Map