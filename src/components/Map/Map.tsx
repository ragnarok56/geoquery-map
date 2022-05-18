import React, { useState, useCallback } from 'react'

import { BitmapLayer } from '@deck.gl/layers'
import { TileLayer } from '@deck.gl/geo-layers'
import { MapView } from '@deck.gl/core'

import DeckGL from 'deck.gl'

import GeohashLayer from '../GeohashLayer/GeohashLayer'

const INITIAL_VIEW_STATE = {
    latitude: 37.8,
    longitude: -122.4,
    zoom: 2,
    bearing: 0,
    pitch: 0
}

interface MapProps {
    seed?: string
}

const Map = ({ seed }: MapProps) => {
    const [viewStates, setViewStates] = useState({
        mainmap: INITIAL_VIEW_STATE,
        minimap: INITIAL_VIEW_STATE
      });

    const data = [
        {
            geohash: '8',
            value: 10
        }
    ]

    const layers = [
        new GeohashLayer({
            id: 'geohash-layer',
            data,
            pickable: true,
            wireframe: false,
            filled: true,
            extruded: true,
            elevationScale: 1000,
            getGeohash: d => d.geohash,
            getFillColor: d => [d.value * 255, (1 - d.value) * 255, (1 - d.value) * 128],
            getElevation: d => d.value
        }),
        new TileLayer({
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
    ]

    const views = [
        new MapView({
            id: 'mainmap'
        }),
        new MapView({
            id: 'minimap',
            x: '80%',
            y: '80%',
            height: '15%',
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
        <DeckGL
            initialViewState={ INITIAL_VIEW_STATE }
            controller
            layers={ layers }
            views={ views }
            viewState={viewStates}
            onViewStateChange={ onViewStateChange }
            />
    )
}

export default Map