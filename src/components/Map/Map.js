import React, { useState, useCallback, useMemo } from 'react'

import { BitmapLayer, PolygonLayer } from '@deck.gl/layers'
import { TileLayer } from '@deck.gl/geo-layers'
import { MapView, WebMercatorViewport } from '@deck.gl/core'
import { EditableGeoJsonLayer } from 'nebula.gl'
import GL from '@luma.gl/constants';

import DeckGL from '@deck.gl/react'

import { generateGeohashes, valueGeneratorGenerator } from '../../data'

import Editor from '../Editor/Editor'
import GeohashLayer from '../GeohashLayer/GeohashLayer'

import { MODES } from '../../utils/editing'

import { EditorState } from '../../types'

const INITIAL_VIEW_STATE = {
    latitude: 0,
    longitude: 0,
    zoom: 1,
    bearing: 0,
    pitch: 0
}

const EMPTY_FEATURE_COLLECTION = {
  type: 'FeatureCollection',
  features: [],
};

function getPositionCount(geometry) {
  const flatMap = (f, arr) => arr.reduce((x, y) => [...x, ...f(y)], []);

  const { type, coordinates } = geometry;
  switch (type) {
    case 'Point':
      return 1;
    case 'LineString':
    case 'MultiPoint':
      return coordinates.length;
    case 'Polygon':
    case 'MultiLineString':
      return flatMap((x) => x, coordinates).length;
    case 'MultiPolygon':
      return flatMap((x) => flatMap((y) => y, x), coordinates).length;
    default:
      throw Error(`Unknown geometry type: ${type}`);
  }
}

function featuresToInfoString(featureCollection) {
  if (!featureCollection || !featureCollection.features) {
    return ""
  }
  const info = featureCollection.features.map(
    (feature) => `${feature.geometry.type}(${getPositionCount(feature.geometry)})`
  );

  return JSON.stringify(info);
}


// interface MapProps {
//     seed?: string,
//     editor: EditorState
//     onEditorUpdated: (editorState: EditorState) => void
// }

function checkLat(value) {
  if (value >= -90 && value <= 90)
    return value
  else
    return value < -90 ? -90 : 90
}

function checkLon(value) {
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

const Map = ({ seed, editor, onEditorUpdated }) => {
    const [viewStates, setViewStates] = useState({
        mainmap: INITIAL_VIEW_STATE,
        minimap: INITIAL_VIEW_STATE
      });
    const [geohashData, setGeohashData] = useState([])
    const [editingFeatures, setEditingFeatures] = useState({
      testFeatures: EMPTY_FEATURE_COLLECTION,
      selectedFeatureIndexes: []
    })

    const valueGenerator = useMemo(() => valueGeneratorGenerator(seed), [seed])

    const [viewBoundsPolygon, setViewBoundsPolygon] = useState([[-180, -90], [-180, 90], [180, 90], [180, -90], [-180, -90]])

    const onSetViewBounds = useCallback(() => {
        const polygon = getViewBoundsClipped(viewStates.mainmap)
        setViewBoundsPolygon(polygon)

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
    
    const onEdit = ({ updatedData, editType, editContext }) => {
      let updatedSelectedFeatureIndexes = editingFeatures.selectedFeatureIndexes;
  
      // if (!['movePosition', 'extruding', 'rotating', 'translating', 'scaling'].includes(editType)) {
      //   // Don't log edits that happen as the pointer moves since they're really chatty
      //   const updatedDataInfo = featuresToInfoString(updatedData);
      //   // eslint-disable-next-line
      //   console.log('onEdit', editType, editContext, updatedDataInfo);
      // }
  
      if (editType === 'addFeature') {
        const { featureIndexes } = editContext;
        // Add the new feature to the selection
        updatedSelectedFeatureIndexes = [...editingFeatures.selectedFeatureIndexes, ...featureIndexes];
      }
  
      setEditingFeatures({
        testFeatures: updatedData,
        selectedFeatureIndexes: updatedSelectedFeatureIndexes,
      });
    };

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
        }),
        new EditableGeoJsonLayer({
          id: 'geojsonEditor',
          data: editingFeatures.testFeatures,
          selectedFeatureIndexes: editingFeatures.selectedFeatureIndexes,
          mode: editor.mode && MODES.filter(x => x.id === editor.mode)[0].handler,
          onEdit: onEdit,
          parameters: {
            depthTest: true,
            depthMask: false,
    
            blend: true,
            blendEquation: GL.FUNC_ADD,
            blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA],
          },
        }),
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

      
    const onSwitchMode = (evt) => {
      const newModeId = evt.target.value === editor.mode ? null : evt.target.value;

      onEditorUpdated({
        ...editor,
        mode: newModeId
      })
    };
    
    return (
        <>
            <DeckGL
                controller
                layerFilter={ layerFilter }
                layers={ layers }
                views={ views }
                viewState={ viewStates }
                onViewStateChange={ onViewStateChange }/>
            <div style={ { position: 'absolute'}}>
              <Editor
                editor={editor}
              />
            </div>
            <div style={ { position: 'absolute', padding: '10px', margin: '50px', top: 0, left: 0 } }>
              <div style={ { cursor: 'pointer', padding: '10px', marginBottom: '10px',background: "#888" } }
                  onClick={ onSetViewBounds }> 
                  <span>Set Bounds</span>
              </div>
              <select onChange={ onSwitchMode }>
                    <option value="">--Please choose a draw mode--</option>
                    {MODES.map((mode) => (
                        <option key={mode.id} value={mode.id}>
                        {mode.text}
                        </option>
                    ))}
                </select>
            </div>
        </>
    )
}

export default Map